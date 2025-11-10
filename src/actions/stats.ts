"use server";

import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getStats = unstable_cache(
  async function getStats() {
    const [
      totalCrabs,
      totalCustomers,
      totalSales,
      totalStocks,
      avgGrossProfit,
      totalRevenue,
      totalCOGS,
      lowStockCount,
      recentSales,
    ] = await Promise.all([
      prisma.crab.count({
        where: {
          active: true,
        },
      }),

      prisma.customer.count({
        where: {
          active: true,
        },
      }),

      prisma.sale.count({
        where: {
          saleStatus: "COMPLETED",
        },
      }),

      prisma.stock.count({
        where: {
          stockStatus: "AVAILABLE",
        },
      }),

      prisma.sale
        .aggregate({
          _avg: {
            grossProfit: true,
          },
          where: {
            saleStatus: "COMPLETED",
          },
        })
        .then((result) => result._avg.grossProfit || 0),

      prisma.sale
        .aggregate({
          _sum: {
            totalPrice: true,
          },
          where: {
            saleStatus: "COMPLETED",
          },
        })
        .then((result) => result._sum.totalPrice || 0),

      prisma.sale
        .aggregate({
          _sum: {
            totalCOGS: true,
          },
          where: {
            saleStatus: "COMPLETED",
          },
        })
        .then((result) => result._sum.totalCOGS || 0),

      prisma.stock.count({
        where: {
          stockStatus: "AVAILABLE",
          remainingStock: {
            lt: 10,
          },
        },
      }),

      prisma.sale.findMany({
        take: 5,
        orderBy: {
          saleDate: "desc",
        },
        where: {
          saleStatus: "COMPLETED",
        },
        select: {
          id: true,
          saleNumber: true,
          saleDate: true,
          totalPrice: true,
          grossProfit: true,
          customer: {
            select: {
              customerName: true,
            },
          },
          buyerName: true,
        },
      }),
    ]);

    const totalGrossProfit = totalRevenue - totalCOGS;

    return {
      totalCrabs,
      totalCustomers,
      totalSales,
      totalStocks,
      avgGrossProfit,
      totalRevenue,
      totalCOGS,
      totalGrossProfit,
      lowStockCount,
      recentSales,
    };
  },
  ["dashboard-stats"],
  {
    revalidate: 3000,
  }
);
