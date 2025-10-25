"use server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

export const getAllCrabs = unstable_cache(
  async function getAllCrabs(
    take: string,
    skip: string,
    sortBy?: string,
    sortOrder?: string
  ) {
    const whereConditions: Prisma.CrabWhereInput = {
      active: true,
    };

    let orderBy: Prisma.CrabOrderByWithRelationInput;

    if (sortBy && sortOrder) {
      orderBy = {
        [sortBy]: sortOrder === "desc" ? "desc" : "asc",
      };
    } else {
      orderBy = {
        createdAt: "desc",
      };
    }

    const [crabs, totalCount] = await Promise.all([
      prisma.crab.findMany({
        where: whereConditions,
        take: parseInt(take, 10),
        skip: parseInt(skip, 10),
        orderBy,
      }),
      prisma.crab.count({
        where: whereConditions,
      }),
    ]);

    return {
      crabs,
      totalCount,
      currentPage: Math.floor(parseInt(skip) / parseInt(take)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(take)),
      itemsPerPage: parseInt(take),
    };
  },
  ["getAllCrabs"],
  {
    revalidate: 3600,
  }
);

export async function addCrab(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const crabCode = formData.get("crabCode") as string;
    const crabName = formData.get("crabName") as string;
    const crabType = formData.get("crabType") as string;
    const sellingPrice = formData.get("sellingPrice") as string;
    const unit = (formData.get("unit") as string) || "Kg";
    const description = formData.get("description") as string;

    if (!crabCode || !crabName || !crabType || !sellingPrice) {
      throw new Error("Kode kepiting, nama, tipe, dan harga jual harus diisi");
    }

    const existingCrab = await prisma.crab.findUnique({
      where: { crabCode },
    });

    if (existingCrab) {
      throw new Error("Kode kepiting sudah terdaftar");
    }

    await prisma.crab.create({
      data: {
        crabCode,
        crabName,
        crabType,
        sellingPrice: parseFloat(sellingPrice),
        unit,
        description: description || null,
        active: true,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    }
    return {
      error: "Terjadi kesalahan saat menambahkan kepiting",
    };
  }

  revalidatePath("/crabs");
  revalidatePath("/dashboard");
  redirect(`/crabs?success=1&message=Data kepiting berhasil ditambahkan`);
}

export async function deleteCrab(id: string) {
  try {
    const crab = await prisma.crab.findUnique({
      where: { id },
    });

    if (!crab) {
      throw new Error("Data kepiting tidak ditemukan");
    }

    const stockCount = await prisma.stock.count({
      where: { crabId: id },
    });

    const saleDetailCount = await prisma.saleDetail.count({
      where: { crabId: id },
    });

    if (stockCount > 0 || saleDetailCount > 0) {
      throw new Error(
        "Tidak dapat menghapus kepiting yang memiliki data stok atau penjualan"
      );
    }

    await prisma.crab.update({
      where: { id },
      data: { active: false },
    });
  } catch (error) {
    if (error instanceof Error) {
      redirect(`/crabs?error=1&message=${encodeURIComponent(error.message)}`);
    }
    redirect(
      `/crabs?error=1&message=${encodeURIComponent(
        "Terjadi kesalahan saat menghapus kepiting"
      )}`
    );
  }

  revalidatePath("/crabs");
  revalidatePath("/dashboard");
  redirect(`/crabs?success=1&message=Data kepiting berhasil dihapus`);
}

export async function updateCrab(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get("id") as string;
    const crabName = formData.get("crabName") as string;
    const crabType = formData.get("crabType") as string;
    const sellingPrice = formData.get("sellingPrice") as string;
    const unit = (formData.get("unit") as string) || "Kg";
    const description = formData.get("description") as string;

    if (!id || !crabName || !crabType || !sellingPrice) {
      throw new Error("ID, nama, tipe, dan harga jual harus diisi");
    }

    const crab = await prisma.crab.findUnique({
      where: { id },
    });

    if (!crab) {
      throw new Error("Data kepiting tidak ditemukan");
    }

    await prisma.crab.update({
      where: { id },
      data: {
        crabName,
        crabType,
        sellingPrice: parseFloat(sellingPrice),
        unit,
        description: description || null,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    }
    return {
      error: "Terjadi kesalahan saat mengubah data kepiting",
    };
  }

  revalidatePath("/crabs");
  revalidatePath("/dashboard");
  redirect(`/crabs?success=1&message=Data kepiting berhasil diubah`);
}
