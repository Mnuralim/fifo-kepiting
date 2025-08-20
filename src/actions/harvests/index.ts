"use server";

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

export const getAllHarvests = unstable_cache(async function getHarvests(
  take: string,
  skip: string,
  sortBy?: string,
  startDate?: string,
  endDate?: string,
  sortOrder?: string
) {
  const whereConditions: Prisma.HarvestRecordWhereInput[] = [];

  if (startDate && endDate) {
    whereConditions.push({
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    });
  }

  let orderBy: Prisma.HarvestRecordOrderByWithRelationInput;
  if (sortBy && sortOrder) {
    orderBy = {
      [sortBy]: sortOrder === "desc" ? "desc" : "asc",
    };
  } else {
    orderBy = {
      date: "asc",
    };
  }

  const [harvests, totalCount] = await Promise.all([
    prisma.harvestRecord.findMany({
      where: {
        AND: whereConditions,
      },
      include: {
        weather: true,
      },
      take: parseInt(take, 10),
      skip: parseInt(skip, 10),
      orderBy,
    }),
    prisma.harvestRecord.count({
      where: {
        AND: whereConditions,
      },
    }),
  ]);

  return {
    harvests,
    totalCount,
    currentPage: Math.floor(parseInt(skip) / parseInt(take)) + 1,
    totalPages: Math.ceil(totalCount / parseInt(take)),
    itemsPerPage: parseInt(take),
  };
});

export const getAllWeathers = unstable_cache(async function getWeathers() {
  return await prisma.weather.findMany({
    orderBy: {
      numericValue: "asc",
    },
  });
});

export async function addHarvestRecord(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const date = formData.get("date") as string;
    const weatherId = formData.get("weatherId") as string;
    const harvestAmount = formData.get("harvestAmount") as string;
    const productionCost = formData.get("productionCost") as string;

    if (!date || !weatherId || !harvestAmount || !productionCost) {
      throw new Error("Semua field harus diisi");
    }

    await prisma.harvestRecord.create({
      data: {
        weatherId,
        date: new Date(date),
        harvestAmount: parseFloat(harvestAmount),
        productionCost: parseFloat(productionCost),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    } else {
      return {
        error: "Terjadi kesalahan saat membuat pembayaran",
      };
    }
  }

  revalidatePath("/harvests");
  revalidatePath("/dashboard");
  redirect(`/harvests?success=1&message=Data berhasil ditambahkan`);
}

export async function deleteHarvestRecord(id: string) {
  try {
    const harvestRecord = await prisma.harvestRecord.findUnique({
      where: {
        id,
      },
    });

    if (!harvestRecord) {
      throw new Error("Data tidak ditemukan");
    }

    await prisma.harvestRecord.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      redirect(`/harvests?error=1&message=${error.message}`);
    } else {
      redirect(
        `/harvests?error=1&message=Terjadi kesalahan saat menghapus cluster`
      );
    }
  }
  revalidatePath("/harvests");
  revalidatePath("/dashboard");
  redirect(`/harvests?success=1&message=Data berhasil dihapus`);
}

export async function updateHarvestRecord(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get("id") as string;
    const date = formData.get("date") as string;
    const weatherId = formData.get("weatherId") as string;
    const harvestAmount = formData.get("harvestAmount") as string;
    const productionCost = formData.get("productionCost") as string;

    if (!id || !date || !weatherId || !harvestAmount || !productionCost) {
      throw new Error("Semua field harus diisi");
    }

    await prisma.harvestRecord.update({
      where: {
        id,
      },
      data: {
        weatherId,
        date: new Date(date),
        harvestAmount: parseFloat(harvestAmount),
        productionCost: parseFloat(productionCost),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    } else {
      return {
        error: "Terjadi kesalahan saat membuat pembayaran",
      };
    }
  }

  revalidatePath("/harvests");
  revalidatePath("/dashboard");
  redirect(`/harvests?success=1&message=Data berhasil diubah`);
}
