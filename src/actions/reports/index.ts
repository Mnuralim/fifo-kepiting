"use server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

type StockWithRelations = Prisma.StockGetPayload<{
  include: {
    crab: {
      select: {
        crabName: true;
        crabCode: true;
        unit: true;
      };
    };
    user: {
      select: {
        name: true;
      };
    };
  };
}>;

interface GroupedByCrab {
  crabName: string;
  crabCode: string;
  unit: string;
  totalEntryQuantity: number;
  totalRemainingStock: number;
  totalCost: number;
  batches: StockWithRelations[];
}

export const getSalesReport = unstable_cache(
  async function getSalesReport(
    startDate: string,
    endDate: string,
    customerId?: string
  ) {
    const whereConditions: Prisma.SaleWhereInput = {
      saleDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      saleStatus: "COMPLETED",
    };

    if (customerId) {
      whereConditions.customerId = customerId;
    }

    const [sales, summary] = await Promise.all([
      prisma.sale.findMany({
        where: whereConditions,
        include: {
          customer: {
            select: {
              customerName: true,
              customerCode: true,
            },
          },
          saleDetails: {
            include: {
              crab: {
                select: {
                  crabName: true,
                  crabCode: true,
                  unit: true,
                },
              },
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          saleDate: "desc",
        },
      }),

      prisma.sale.aggregate({
        where: whereConditions,
        _sum: {
          totalPrice: true,
          totalCOGS: true,
          grossProfit: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      sales,
      summary: {
        totalSales: summary._sum.totalPrice || 0,
        totalCOGS: summary._sum.totalCOGS || 0,
        totalGrossProfit: summary._sum.grossProfit || 0,
        transactionCount: summary._count.id || 0,
        profitMargin:
          summary._sum.totalPrice && summary._sum.totalPrice > 0
            ? ((summary._sum.grossProfit || 0) / summary._sum.totalPrice) * 100
            : 0,
      },
    };
  },
  ["getSalesReport"],
  {
    revalidate: 300,
  }
);

export const getStockReport = unstable_cache(
  async function getStockReport(crabId?: string) {
    const whereConditions: Prisma.StockWhereInput = {};

    if (crabId) {
      whereConditions.crabId = crabId;
    }

    const stocks = await prisma.stock.findMany({
      where: whereConditions,
      include: {
        crab: {
          select: {
            crabName: true,
            crabCode: true,
            unit: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ crabId: "asc" }, { entryDate: "asc" }],
    });

    // Group by crab
    const groupedByCrab = stocks.reduce((acc, stock) => {
      const crabId = stock.crabId;
      if (!acc[crabId]) {
        acc[crabId] = {
          crabName: stock.crab.crabName,
          crabCode: stock.crab.crabCode,
          unit: stock.crab.unit,
          totalEntryQuantity: 0,
          totalRemainingStock: 0,
          totalCost: 0,
          batches: [],
        };
      }
      acc[crabId].totalEntryQuantity += stock.entryQuantity;
      acc[crabId].totalRemainingStock += stock.remainingStock;
      acc[crabId].totalCost += stock.totalCost;
      acc[crabId].batches.push(stock);
      return acc;
    }, {} as Record<string, GroupedByCrab>);

    const summary = {
      totalBatches: stocks.length,
      totalAvailableBatches: stocks.filter((s) => s.stockStatus === "AVAILABLE")
        .length,
      totalEmptyBatches: stocks.filter((s) => s.stockStatus === "EMPTY").length,
      totalStockValue: stocks.reduce(
        (sum, s) => sum + s.remainingStock * s.purchasePrice,
        0
      ),
      totalRemainingStock: stocks.reduce((sum, s) => sum + s.remainingStock, 0),
    };

    return {
      stocks,
      groupedByCrab: Object.values(groupedByCrab),
      summary,
    };
  },
  ["getStockReport"],
  {
    revalidate: 300,
  }
);

export const getProfitLossReport = unstable_cache(
  async function getProfitLossReport(startDate: string, endDate: string) {
    const whereConditions: Prisma.SaleWhereInput = {
      saleDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      saleStatus: "COMPLETED",
    };

    // Data penjualan
    const salesData = await prisma.sale.aggregate({
      where: whereConditions,
      _sum: {
        totalPrice: true,
        totalCOGS: true,
        grossProfit: true,
      },
      _count: {
        id: true,
      },
    });

    // Top selling products
    const topProducts = await prisma.saleDetail.groupBy({
      by: ["crabId"],
      where: {
        sale: whereConditions,
      },
      _sum: {
        quantity: true,
        subtotal: true,
        grossProfit: true,
      },
      orderBy: {
        _sum: {
          subtotal: "desc",
        },
      },
      take: 10,
    });

    // Ambil detail kepiting
    const crabIds = topProducts.map((p) => p.crabId);
    const crabs = await prisma.crab.findMany({
      where: {
        id: {
          in: crabIds,
        },
      },
      select: {
        id: true,
        crabName: true,
        crabCode: true,
        unit: true,
      },
    });

    const topProductsWithDetails = topProducts.map((product) => {
      const crab = crabs.find((c) => c.id === product.crabId);
      return {
        ...product,
        crab,
      };
    });

    // Best customers
    const topCustomers = await prisma.sale.groupBy({
      by: ["customerId"],
      where: whereConditions,
      _sum: {
        totalPrice: true,
        grossProfit: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalPrice: "desc",
        },
      },
      take: 10,
    });

    // Ambil detail customer
    const customerIds = topCustomers
      .map((c) => c.customerId)
      .filter((id): id is string => id !== null);
    const customers = await prisma.customer.findMany({
      where: {
        id: {
          in: customerIds,
        },
      },
      select: {
        id: true,
        customerName: true,
        customerCode: true,
      },
    });

    const topCustomersWithDetails = topCustomers.map((customer) => {
      const customerDetail = customers.find(
        (c) => c.id === customer.customerId
      );
      return {
        ...customer,
        customer: customerDetail,
      };
    });

    return {
      summary: {
        totalRevenue: salesData._sum.totalPrice || 0,
        totalCOGS: salesData._sum.totalCOGS || 0,
        totalGrossProfit: salesData._sum.grossProfit || 0,
        transactionCount: salesData._count.id || 0,
        profitMargin:
          salesData._sum.totalPrice && salesData._sum.totalPrice > 0
            ? ((salesData._sum.grossProfit || 0) / salesData._sum.totalPrice) *
              100
            : 0,
      },
      topProducts: topProductsWithDetails,
      topCustomers: topCustomersWithDetails,
    };
  },
  ["getProfitLossReport"],
  {
    revalidate: 300,
  }
);

export const getStockMovementReport = unstable_cache(
  async function getStockMovementReport(
    startDate: string,
    endDate: string,
    crabId?: string
  ) {
    const stockInConditions: Prisma.StockWhereInput = {
      entryDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (crabId) {
      stockInConditions.crabId = crabId;
    }

    // Stock In
    const stockIn = await prisma.stock.findMany({
      where: stockInConditions,
      include: {
        crab: {
          select: {
            crabName: true,
            crabCode: true,
            unit: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        entryDate: "desc",
      },
    });

    const stockInSummary = await prisma.stock.aggregate({
      where: stockInConditions,
      _sum: {
        entryQuantity: true,
        totalCost: true,
      },
    });

    // Stock Out
    const stockOutConditions: Prisma.StockOutDetailWhereInput = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (crabId) {
      stockOutConditions.stock = {
        crabId: crabId,
      };
    }

    const stockOut = await prisma.stockOutDetail.findMany({
      where: stockOutConditions,
      include: {
        stock: {
          include: {
            crab: {
              select: {
                crabName: true,
                crabCode: true,
                unit: true,
              },
            },
          },
        },
        saleDetail: {
          include: {
            sale: {
              select: {
                saleNumber: true,
                saleDate: true,
                customer: {
                  select: {
                    customerName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const stockOutSummary = await prisma.stockOutDetail.aggregate({
      where: stockOutConditions,
      _sum: {
        quantityOut: true,
        totalPurchaseCost: true,
      },
    });

    return {
      stockIn: {
        data: stockIn,
        summary: {
          totalQuantity: stockInSummary._sum.entryQuantity || 0,
          totalCost: stockInSummary._sum.totalCost || 0,
          totalBatches: stockIn.length,
        },
      },
      stockOut: {
        data: stockOut,
        summary: {
          totalQuantity: stockOutSummary._sum.quantityOut || 0,
          totalCost: stockOutSummary._sum.totalPurchaseCost || 0,
          totalTransactions: stockOut.length,
        },
      },
    };
  },
  ["getStockMovementReport"],
  {
    revalidate: 300,
  }
);

export async function generateFinalReport(
  period: string,
  periodType: "month" | "year"
) {
  try {
    let startDate: Date;
    let endDate: Date;

    if (periodType === "month") {
      const [year, month] = period.split("-");
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(parseInt(period), 0, 1);
      endDate = new Date(parseInt(period), 11, 31, 23, 59, 59, 999);
    }

    const existingReport = await prisma.finalReport.findUnique({
      where: { period },
    });

    const salesData = await prisma.sale.aggregate({
      where: {
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
        saleStatus: "COMPLETED",
      },
      _sum: {
        totalPrice: true,
        totalCOGS: true,
        grossProfit: true,
      },
      _count: {
        id: true,
      },
    });

    const stockInData = await prisma.stock.aggregate({
      where: {
        entryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        entryQuantity: true,
      },
    });

    const stockOutData = await prisma.stockOutDetail.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        quantityOut: true,
      },
    });

    const reportData = {
      period,
      startDate,
      endDate,
      totalSales: salesData._sum.totalPrice || 0,
      totalCOGS: salesData._sum.totalCOGS || 0,
      totalGrossProfit: salesData._sum.grossProfit || 0,
      transactionCount: salesData._count.id || 0,
      totalStockIn: stockInData._sum.entryQuantity || 0,
      totalStockOut: stockOutData._sum.quantityOut || 0,
    };

    let report;
    if (existingReport) {
      report = await prisma.finalReport.update({
        where: { period },
        data: reportData,
      });
    } else {
      report = await prisma.finalReport.create({
        data: reportData,
      });
    }

    return {
      success: true,
      report,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Terjadi kesalahan saat generate laporan",
    };
  }
}

export const getAllFinalReports = unstable_cache(
  async function getAllFinalReports() {
    const reports = await prisma.finalReport.findMany({
      orderBy: {
        period: "desc",
      },
    });

    return reports;
  },
  ["getAllFinalReports"],
  {
    revalidate: 300,
  }
);

export const getFinalReportByPeriod = unstable_cache(
  async function getFinalReportByPeriod(period: string) {
    const report = await prisma.finalReport.findUnique({
      where: { period },
    });

    return report;
  },
  ["getFinalReportByPeriod"],
  {
    revalidate: 300,
  }
);

export const getDashboardStats = unstable_cache(
  async function getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalProducts,
      totalStock,
      todaySales,
      todayRevenue,
      lowStockProducts,
      recentSales,
    ] = await Promise.all([
      prisma.crab.count({
        where: { active: true },
      }),

      prisma.stock.aggregate({
        where: {
          stockStatus: "AVAILABLE",
        },
        _sum: {
          remainingStock: true,
        },
      }),

      prisma.sale.count({
        where: {
          saleDate: {
            gte: today,
            lt: tomorrow,
          },
          saleStatus: "COMPLETED",
        },
      }),

      prisma.sale.aggregate({
        where: {
          saleDate: {
            gte: today,
            lt: tomorrow,
          },
          saleStatus: "COMPLETED",
        },
        _sum: {
          totalPrice: true,
          grossProfit: true,
        },
      }),

      prisma.stock.groupBy({
        by: ["crabId"],
        where: {
          stockStatus: "AVAILABLE",
        },
        _sum: {
          remainingStock: true,
        },
        having: {
          remainingStock: {
            _sum: {
              lt: 10,
            },
          },
        },
      }),

      prisma.sale.findMany({
        take: 5,
        where: {
          saleStatus: "COMPLETED",
        },
        include: {
          customer: {
            select: {
              customerName: true,
            },
          },
        },
        orderBy: {
          saleDate: "desc",
        },
      }),
    ]);

    return {
      totalProducts,
      totalStock: totalStock._sum.remainingStock || 0,
      todaySales,
      todayRevenue: todayRevenue._sum.totalPrice || 0,
      todayProfit: todayRevenue._sum.grossProfit || 0,
      lowStockCount: lowStockProducts.length,
      recentSales,
    };
  },
  ["getDashboardStats"],
  {
    revalidate: 60,
  }
);
