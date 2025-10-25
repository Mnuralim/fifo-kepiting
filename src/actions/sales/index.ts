"use server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../session";

// Interface untuk item penjualan
interface SaleItemInput {
  crabId: string;
  quantity: number;
  unitPrice: number;
}

// Interface untuk detail stock yang digunakan
interface StockUsageDetail {
  stockId: string;
  quantityUsed: number;
  unitPurchasePrice: number;
  totalCost: number;
}

// Get all sales with pagination and filters
export const getAllSales = unstable_cache(
  async function getAllSales(
    take: string,
    skip: string,
    sortBy?: string,
    sortOrder?: string,
    customerId?: string,
    startDate?: string,
    endDate?: string,
    saleStatus?: string
  ) {
    const whereConditions: Prisma.SaleWhereInput = {};

    if (customerId) {
      whereConditions.customerId = customerId;
    }

    if (saleStatus) {
      whereConditions.saleStatus = saleStatus as "COMPLETED" | "CANCELLED";
    }

    if (startDate && endDate) {
      whereConditions.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    let orderBy: Prisma.SaleOrderByWithRelationInput;

    if (sortBy && sortOrder) {
      orderBy = {
        [sortBy]: sortOrder === "desc" ? "desc" : "asc",
      };
    } else {
      orderBy = {
        saleDate: "desc",
      };
    }

    const [sales, totalCount] = await Promise.all([
      prisma.sale.findMany({
        where: whereConditions,
        take: parseInt(take, 10),
        skip: parseInt(skip, 10),
        orderBy,
        include: {
          customer: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          saleDetails: {
            include: {
              crab: true,
            },
          },
        },
      }),
      prisma.sale.count({
        where: whereConditions,
      }),
    ]);

    return {
      sales,
      totalCount,
      currentPage: Math.floor(parseInt(skip) / parseInt(take)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(take)),
      itemsPerPage: parseInt(take),
    };
  },
  ["getAllSales"],
  {
    revalidate: 30,
  }
);

// Get sale by ID with details
export const getSaleById = unstable_cache(
  async function getSaleById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        saleDetails: {
          include: {
            crab: true,
            stockOutDetails: {
              include: {
                stock: true,
              },
            },
          },
        },
      },
    });

    return sale;
  },
  ["getSaleById"],
  {
    revalidate: 60,
  }
);

// Process stock out using FIFO method
async function processStockOutFIFO(
  crabId: string,
  quantityNeeded: number
): Promise<StockUsageDetail[]> {
  // Get available stocks in FIFO order (oldest first)
  const availableStocks = await prisma.stock.findMany({
    where: {
      crabId,
      stockStatus: "AVAILABLE",
      remainingStock: {
        gt: 0,
      },
    },
    orderBy: {
      entryDate: "asc", // FIFO: First In First Out
    },
  });

  if (availableStocks.length === 0) {
    throw new Error("Stok tidak tersedia untuk produk ini");
  }

  // Calculate total available stock
  const totalAvailable = availableStocks.reduce(
    (sum, stock) => sum + stock.remainingStock,
    0
  );

  if (totalAvailable < quantityNeeded) {
    throw new Error(
      `Stok tidak mencukupi. Tersedia: ${totalAvailable}, Dibutuhkan: ${quantityNeeded}`
    );
  }

  const stockUsageDetails: StockUsageDetail[] = [];
  let remainingQuantity = quantityNeeded;

  // Process each stock batch in FIFO order
  for (const stock of availableStocks) {
    if (remainingQuantity <= 0) break;

    const quantityToTake = Math.min(stock.remainingStock, remainingQuantity);

    stockUsageDetails.push({
      stockId: stock.id,
      quantityUsed: quantityToTake,
      unitPurchasePrice: stock.purchasePrice,
      totalCost: quantityToTake * stock.purchasePrice,
    });

    remainingQuantity -= quantityToTake;
  }

  return stockUsageDetails;
}

// Calculate COGS for sale item using FIFO
async function calculateCOGSFIFO(
  crabId: string,
  quantity: number
): Promise<{ totalCOGS: number; stockUsageDetails: StockUsageDetail[] }> {
  const stockUsageDetails = await processStockOutFIFO(crabId, quantity);

  const totalCOGS = stockUsageDetails.reduce(
    (sum, detail) => sum + detail.totalCost,
    0
  );

  return {
    totalCOGS,
    stockUsageDetails,
  };
}

// Add new sale with FIFO COGS calculation
export async function addSale(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const saleNumber = formData.get("saleNumber") as string;
    const saleDate = formData.get("saleDate") as string;
    const customerId = formData.get("customerId") as string;
    const buyerName = formData.get("buyerName") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const notes = formData.get("notes") as string;

    // Parse sale items from JSON
    const saleItemsJson = formData.get("saleItems") as string;
    const saleItems: SaleItemInput[] = JSON.parse(saleItemsJson);

    const session = await getSession();
    const userId = session?.id as string;

    if (
      !saleNumber ||
      !saleDate ||
      !userId ||
      !saleItems ||
      saleItems.length === 0
    ) {
      throw new Error("Data penjualan tidak lengkap");
    }

    // Validate sale number uniqueness
    const existingSale = await prisma.sale.findUnique({
      where: { saleNumber },
    });

    if (existingSale) {
      throw new Error("Nomor penjualan sudah terdaftar");
    }

    // Validate customer if provided
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new Error("Data pelanggan tidak ditemukan");
      }
    }

    // Calculate totals and prepare sale details
    let totalPrice = 0;
    let totalCOGS = 0;
    const saleDetailsData: {
      crabId: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      totalCOGS: number;
      grossProfit: number;
      stockUsageDetails: StockUsageDetail[];
    }[] = [];

    for (const item of saleItems) {
      // Validate crab exists
      const crab = await prisma.crab.findUnique({
        where: { id: item.crabId },
      });

      if (!crab) {
        throw new Error(`Produk dengan ID ${item.crabId} tidak ditemukan`);
      }

      // Calculate COGS using FIFO
      const { totalCOGS: itemCOGS, stockUsageDetails } =
        await calculateCOGSFIFO(item.crabId, item.quantity);

      const subtotal = item.quantity * item.unitPrice;
      const grossProfit = subtotal - itemCOGS;

      totalPrice += subtotal;
      totalCOGS += itemCOGS;

      saleDetailsData.push({
        crabId: item.crabId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal,
        totalCOGS: itemCOGS,
        grossProfit,
        stockUsageDetails,
      });
    }

    const grossProfit = totalPrice - totalCOGS;

    // Create sale with transaction
    await prisma.$transaction(async (tx) => {
      // Create sale record
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          saleDate: new Date(saleDate),
          customerId: customerId,
          buyerName: buyerName || null,
          totalPrice,
          totalCOGS,
          grossProfit,
          paymentMethod,
          saleStatus: "COMPLETED",
          notes: notes || null,
          userId,
        },
      });

      // Create sale details and stock out details
      for (const detailData of saleDetailsData) {
        // Create sale detail
        const saleDetail = await tx.saleDetail.create({
          data: {
            saleId: sale.id,
            crabId: detailData.crabId,
            quantity: detailData.quantity,
            unitPrice: detailData.unitPrice,
            subtotal: detailData.subtotal,
            totalCOGS: detailData.totalCOGS,
            grossProfit: detailData.grossProfit,
          },
        });

        // Create stock out details and update remaining stock
        for (const stockUsage of detailData.stockUsageDetails) {
          // Create stock out detail
          await tx.stockOutDetail.create({
            data: {
              saleDetailId: saleDetail.id,
              stockId: stockUsage.stockId,
              quantityOut: stockUsage.quantityUsed,
              unitPurchasePrice: stockUsage.unitPurchasePrice,
              totalPurchaseCost: stockUsage.totalCost,
            },
          });

          // Update remaining stock
          const stock = await tx.stock.findUnique({
            where: { id: stockUsage.stockId },
          });

          if (stock) {
            const newRemainingStock =
              stock.remainingStock - stockUsage.quantityUsed;

            await tx.stock.update({
              where: { id: stockUsage.stockId },
              data: {
                remainingStock: newRemainingStock,
                stockStatus: newRemainingStock <= 0 ? "EMPTY" : "AVAILABLE",
              },
            });
          }
        }
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    }
    return {
      error: "Terjadi kesalahan saat menambahkan penjualan",
    };
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/stocks");
  redirect(`/sales?success=1&message=Transaksi penjualan berhasil ditambahkan`);
}

// Cancel sale and restore stock
export async function cancelSale(id: string) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        saleDetails: {
          include: {
            stockOutDetails: true,
          },
        },
      },
    });

    if (!sale) {
      throw new Error("Data penjualan tidak ditemukan");
    }

    if (sale.saleStatus === "CANCELLED") {
      throw new Error("Penjualan sudah dibatalkan sebelumnya");
    }

    // Cancel sale and restore stock in transaction
    await prisma.$transaction(async (tx) => {
      // Update sale status
      await tx.sale.update({
        where: { id },
        data: {
          saleStatus: "CANCELLED",
        },
      });

      // Restore stock for each sale detail
      for (const saleDetail of sale.saleDetails) {
        for (const stockOut of saleDetail.stockOutDetails) {
          const stock = await tx.stock.findUnique({
            where: { id: stockOut.stockId },
          });

          if (stock) {
            const newRemainingStock =
              stock.remainingStock + stockOut.quantityOut;

            await tx.stock.update({
              where: { id: stockOut.stockId },
              data: {
                remainingStock: newRemainingStock,
                stockStatus: "AVAILABLE",
              },
            });
          }
        }
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      redirect(`/sales?error=1&message=${encodeURIComponent(error.message)}`);
    }
    redirect(
      `/sales?error=1&message=${encodeURIComponent(
        "Terjadi kesalahan saat membatalkan penjualan"
      )}`
    );
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/stocks");
  redirect(
    `/sales?success=1&message=Penjualan berhasil dibatalkan dan stok dikembalikan`
  );
}

// Delete sale (only if not processed yet)
export async function deleteSale(id: string) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        saleDetails: {
          include: {
            stockOutDetails: true,
          },
        },
      },
    });

    if (!sale) {
      throw new Error("Data penjualan tidak ditemukan");
    }

    if (sale.saleStatus === "COMPLETED") {
      throw new Error(
        "Tidak dapat menghapus penjualan yang sudah selesai. Gunakan fitur pembatalan."
      );
    }

    // Delete sale will cascade to saleDetails and stockOutDetails
    await prisma.sale.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Error) {
      redirect(`/sales?error=1&message=${encodeURIComponent(error.message)}`);
    }
    redirect(
      `/sales?error=1&message=${encodeURIComponent(
        "Terjadi kesalahan saat menghapus penjualan"
      )}`
    );
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  redirect(`/sales?success=1&message=Data penjualan berhasil dihapus`);
}

// Get sales summary for dashboard
export const getSalesSummary = unstable_cache(
  async function getSalesSummary(startDate?: Date, endDate?: Date) {
    const whereConditions: Prisma.SaleWhereInput = {
      saleStatus: "COMPLETED",
    };

    if (startDate && endDate) {
      whereConditions.saleDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [totalSales, salesCount, salesData] = await Promise.all([
      prisma.sale.aggregate({
        where: whereConditions,
        _sum: {
          totalPrice: true,
          totalCOGS: true,
          grossProfit: true,
        },
      }),
      prisma.sale.count({
        where: whereConditions,
      }),
      prisma.sale.findMany({
        where: whereConditions,
        orderBy: {
          saleDate: "desc",
        },
        take: 10,
        include: {
          customer: true,
          saleDetails: {
            include: {
              crab: true,
            },
          },
        },
      }),
    ]);

    return {
      totalRevenue: totalSales._sum.totalPrice || 0,
      totalCOGS: totalSales._sum.totalCOGS || 0,
      totalGrossProfit: totalSales._sum.grossProfit || 0,
      transactionCount: salesCount,
      recentSales: salesData,
    };
  },
  ["getSalesSummary"],
  {
    revalidate: 30,
  }
);
