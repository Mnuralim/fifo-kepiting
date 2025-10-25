"use server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

export const getAllCustomers = unstable_cache(
  async function getAllCustomers(
    take: string,
    skip: string,
    sortBy?: string,
    sortOrder?: string,
    search?: string
  ) {
    const whereConditions: Prisma.CustomerWhereInput = {
      active: true,
    };

    if (search) {
      whereConditions.OR = [
        {
          customerName: {
            contains: search,
          },
        },
        {
          customerCode: {
            contains: search,
          },
        },
        {
          phone: {
            contains: search,
          },
        },
      ];
    }

    let orderBy: Prisma.CustomerOrderByWithRelationInput;

    if (sortBy && sortOrder) {
      orderBy = {
        [sortBy]: sortOrder === "desc" ? "desc" : "asc",
      };
    } else {
      orderBy = {
        createdAt: "desc",
      };
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where: whereConditions,
        take: parseInt(take, 10),
        skip: parseInt(skip, 10),
        orderBy,
      }),
      prisma.customer.count({
        where: whereConditions,
      }),
    ]);

    return {
      customers,
      totalCount,
      currentPage: Math.floor(parseInt(skip) / parseInt(take)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(take)),
      itemsPerPage: parseInt(take),
    };
  },
  ["getAllCustomers"],
  {
    revalidate: 3600,
  }
);

export async function addCustomer(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const customerCode = formData.get("customerCode") as string;
    const customerName = formData.get("customerName") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const businessType = formData.get("businessType") as string;

    if (!customerCode || !customerName) {
      throw new Error("Kode pelanggan dan nama pelanggan harus diisi");
    }

    // Check if customer code already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { customerCode },
    });

    if (existingCustomer) {
      throw new Error("Kode pelanggan sudah terdaftar");
    }

    await prisma.customer.create({
      data: {
        customerCode,
        customerName,
        address: address || null,
        phone: phone || null,
        businessType: businessType || null,
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
      error: "Terjadi kesalahan saat menambahkan pelanggan",
    };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  redirect(`/customers?success=1&message=Data pelanggan berhasil ditambahkan`);
}

export async function deleteCustomer(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new Error("Data pelanggan tidak ditemukan");
    }

    // Check if customer has related sales
    const saleCount = await prisma.sale.count({
      where: { customerId: id },
    });

    if (saleCount > 0) {
      throw new Error(
        "Tidak dapat menghapus pelanggan yang memiliki data penjualan"
      );
    }

    // Soft delete by setting active to false
    await prisma.customer.update({
      where: { id },
      data: { active: false },
    });
  } catch (error) {
    if (error instanceof Error) {
      redirect(
        `/customers?error=1&message=${encodeURIComponent(error.message)}`
      );
    }
    redirect(
      `/customers?error=1&message=${encodeURIComponent(
        "Terjadi kesalahan saat menghapus pelanggan"
      )}`
    );
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  redirect(`/customers?success=1&message=Data pelanggan berhasil dihapus`);
}

export async function updateCustomer(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get("id") as string;
    const customerName = formData.get("customerName") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const businessType = formData.get("businessType") as string;

    if (!id || !customerName) {
      throw new Error("ID dan nama pelanggan harus diisi");
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new Error("Data pelanggan tidak ditemukan");
    }

    await prisma.customer.update({
      where: { id },
      data: {
        customerName,
        address: address || null,
        phone: phone || null,
        businessType: businessType || null,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    }
    return {
      error: "Terjadi kesalahan saat mengubah data pelanggan",
    };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  redirect(`/customers?success=1&message=Data pelanggan berhasil diubah`);
}
