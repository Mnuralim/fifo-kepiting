"use server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../session";

// Get all stocks with pagination and filters
export const getAllStocks = unstable_cache(
  async function getAllStocks(
    take: string,
    skip: string,
    sortBy?: string,
    sortOrder?: string,
    crabId?: string,
    stockStatus?: string
  ) {
    const whereConditions: Prisma.StockWhereInput = {};

    if (crabId) {
      whereConditions.crabId = crabId;
    }

    if (stockStatus) {
      whereConditions.stockStatus = stockStatus as "AVAILABLE" | "EMPTY";
    }

    let orderBy: Prisma.StockOrderByWithRelationInput;

    if (sortBy && sortOrder) {
      orderBy = {
        [sortBy]: sortOrder === "desc" ? "desc" : "asc",
      };
    } else {
      orderBy = {
        entryDate: "asc", // Default sort by entry date (FIFO)
      };
    }

    const [stocks, totalCount] = await Promise.all([
      prisma.stock.findMany({
        where: whereConditions,
        take: parseInt(take, 10),
        skip: parseInt(skip, 10),
        orderBy,
        include: {
          crab: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      }),
      prisma.stock.count({
        where: whereConditions,
      }),
    ]);

    return {
      stocks,
      totalCount,
      currentPage: Math.floor(parseInt(skip) / parseInt(take)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(take)),
      itemsPerPage: parseInt(take),
    };
  },
  ["getAllStocks"],
  {
    revalidate: 60, // Cache for 1 minute (stock data changes frequently)
  }
);

// Get available stock for specific crab (FIFO order)
export const getAvailableStockFIFO = unstable_cache(
  async function getAvailableStockFIFO(crabId: string) {
    const stocks = await prisma.stock.findMany({
      where: {
        crabId,
        stockStatus: "AVAILABLE",
        remainingStock: {
          gt: 0,
        },
      },
      orderBy: {
        entryDate: "asc", // FIFO: oldest first
      },
      include: {
        crab: true,
      },
    });

    return stocks;
  },
  ["getAvailableStockFIFO"],
  {
    revalidate: 30,
  }
);

// Get stock summary by crab
export const getStockSummary = unstable_cache(
  async function getStockSummary() {
    const stocks = await prisma.stock.groupBy({
      by: ["crabId"],
      where: {
        stockStatus: "AVAILABLE",
      },
      _sum: {
        remainingStock: true,
      },
    });

    const stocksWithCrab = await Promise.all(
      stocks.map(async (stock) => {
        const crab = await prisma.crab.findUnique({
          where: { id: stock.crabId },
        });
        return {
          crab,
          totalStock: stock._sum.remainingStock || 0,
        };
      })
    );

    return stocksWithCrab;
  },
  ["getStockSummary"],
  {
    revalidate: 60,
  }
);

// Add new stock entry
export async function addStock(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const stockCode = formData.get("stockCode") as string;
    const crabId = formData.get("crabId") as string;
    const entryDate = formData.get("entryDate") as string;
    const entryQuantity = formData.get("entryQuantity") as string;
    const purchasePrice = formData.get("purchasePrice") as string;
    const supplier = formData.get("supplier") as string;
    const notes = formData.get("notes") as string;

    const session = await getSession();
    const userId = session?.id as string;

    if (
      !stockCode ||
      !crabId ||
      !entryDate ||
      !entryQuantity ||
      !purchasePrice ||
      !userId
    ) {
      throw new Error(
        "Kode stok, kepiting, tanggal masuk, jumlah, harga beli, dan user harus diisi"
      );
    }

    const existingStock = await prisma.stock.findUnique({
      where: { stockCode },
    });

    if (existingStock) {
      throw new Error("Kode stok sudah terdaftar");
    }

    const crab = await prisma.crab.findUnique({
      where: { id: crabId },
    });

    if (!crab) {
      throw new Error("Data kepiting tidak ditemukan");
    }

    const quantity = parseFloat(entryQuantity);
    const price = parseFloat(purchasePrice);
    const totalCost = quantity * price;

    await prisma.stock.create({
      data: {
        stockCode,
        crabId,
        entryDate: new Date(entryDate),
        entryQuantity: quantity,
        remainingStock: quantity, // Initially same as entry quantity
        purchasePrice: price,
        totalCost,
        supplier: supplier || null,
        notes: notes || null,
        stockStatus: "AVAILABLE",
        userId,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    }
    return {
      error: "Terjadi kesalahan saat menambahkan stok",
    };
  }

  revalidatePath("/stocks");
  revalidatePath("/dashboard");
  redirect(`/stocks?success=1&message=Data stok berhasil ditambahkan`);
}

// Update stock entry
export async function updateStock(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get("id") as string;
    const entryDate = formData.get("entryDate") as string;
    const entryQuantity = formData.get("entryQuantity") as string;
    const purchasePrice = formData.get("purchasePrice") as string;
    const supplier = formData.get("supplier") as string;
    const notes = formData.get("notes") as string;

    if (!id || !entryDate || !entryQuantity || !purchasePrice) {
      throw new Error("ID, tanggal masuk, jumlah, dan harga beli harus diisi");
    }

    const stock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      throw new Error("Data stok tidak ditemukan");
    }

    // Check if stock has been used in sales
    const usedInSales = await prisma.stockOutDetail.count({
      where: { stockId: id },
    });

    if (usedInSales > 0) {
      throw new Error(
        "Tidak dapat mengubah stok yang sudah digunakan dalam penjualan"
      );
    }

    const quantity = parseFloat(entryQuantity);
    const price = parseFloat(purchasePrice);
    const totalCost = quantity * price;

    await prisma.stock.update({
      where: { id },
      data: {
        entryDate: new Date(entryDate),
        entryQuantity: quantity,
        remainingStock: quantity,
        purchasePrice: price,
        totalCost,
        supplier: supplier || null,
        notes: notes || null,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    }
    return {
      error: "Terjadi kesalahan saat mengubah data stok",
    };
  }

  revalidatePath("/stocks");
  revalidatePath("/dashboard");
  redirect(`/stocks?success=1&message=Data stok berhasil diubah`);
}

// Delete stock entry
export async function deleteStock(id: string) {
  try {
    const stock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      throw new Error("Data stok tidak ditemukan");
    }

    // Check if stock has been used in sales
    const usedInSales = await prisma.stockOutDetail.count({
      where: { stockId: id },
    });

    if (usedInSales > 0) {
      throw new Error(
        "Tidak dapat menghapus stok yang sudah digunakan dalam penjualan"
      );
    }

    await prisma.stock.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Error) {
      redirect(`/stocks?error=1&message=${encodeURIComponent(error.message)}`);
    }
    redirect(
      `/stocks?error=1&message=${encodeURIComponent(
        "Terjadi kesalahan saat menghapus stok"
      )}`
    );
  }

  revalidatePath("/stocks");
  revalidatePath("/dashboard");
  redirect(`/stocks?success=1&message=Data stok berhasil dihapus`);
}

// Update remaining stock (used internally by sale process)
export async function updateRemainingStock(
  stockId: string,
  quantityUsed: number
) {
  const stock = await prisma.stock.findUnique({
    where: { id: stockId },
  });

  if (!stock) {
    throw new Error("Data stok tidak ditemukan");
  }

  const newRemainingStock = stock.remainingStock - quantityUsed;

  if (newRemainingStock < 0) {
    throw new Error("Jumlah stok tidak mencukupi");
  }

  await prisma.stock.update({
    where: { id: stockId },
    data: {
      remainingStock: newRemainingStock,
      stockStatus: newRemainingStock === 0 ? "EMPTY" : "AVAILABLE",
    },
  });

  return newRemainingStock;
}

// Get stock history with details
export const getStockHistory = unstable_cache(
  async function getStockHistory(crabId?: string) {
    const whereConditions: Prisma.StockWhereInput = {};

    if (crabId) {
      whereConditions.crabId = crabId;
    }

    const stocks = await prisma.stock.findMany({
      where: whereConditions,
      orderBy: {
        entryDate: "desc",
      },
      include: {
        crab: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        stockOutDetails: {
          include: {
            saleDetail: {
              include: {
                sale: true,
              },
            },
          },
        },
      },
    });

    return stocks;
  },
  ["getStockHistory"],
  {
    revalidate: 300,
  }
);

// Get stock card (kartu stok) for specific crab
export async function getStockCard(
  crabId: string,
  startDate?: Date,
  endDate?: Date
) {
  const whereConditions: Prisma.StockWhereInput = {
    crabId,
  };

  if (startDate || endDate) {
    whereConditions.entryDate = {};
    if (startDate) {
      whereConditions.entryDate.gte = startDate;
    }
    if (endDate) {
      whereConditions.entryDate.lte = endDate;
    }
  }

  const stocks = await prisma.stock.findMany({
    where: whereConditions,
    orderBy: {
      entryDate: "asc",
    },
    include: {
      crab: true,
      stockOutDetails: {
        include: {
          saleDetail: {
            include: {
              sale: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  // Calculate running balance
  const stockCard = stocks.flatMap((stock) => {
    const entries = [];

    // Stock in entry
    entries.push({
      date: stock.entryDate,
      description: `Stok Masuk - ${stock.stockCode}`,
      supplier: stock.supplier,
      stockIn: stock.entryQuantity,
      stockOut: 0,
      balance: stock.entryQuantity,
      purchasePrice: stock.purchasePrice,
      notes: stock.notes,
    });

    // Stock out entries
    stock.stockOutDetails.forEach((outDetail) => {
      entries.push({
        date: outDetail.createdAt,
        description: `Penjualan - ${outDetail.saleDetail.sale.saleNumber}`,
        supplier: null,
        stockIn: 0,
        stockOut: outDetail.quantityOut,
        balance: 0, // Will calculate running balance later
        purchasePrice: outDetail.unitPurchasePrice,
        notes: null,
      });
    });

    return entries;
  });

  // Calculate running balance
  let runningBalance = 0;
  stockCard.forEach((entry) => {
    runningBalance += entry.stockIn - entry.stockOut;
    entry.balance = runningBalance;
  });

  return stockCard;
}
