"use server";

import prisma from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, deleteSession, getSession } from "../session";
import { revalidatePath, unstable_cache } from "next/cache";

export async function login(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return {
      error: "Username dan password harus diisi",
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
        active: true,
      },
    });

    if (!existingUser) {
      return {
        error: "Pengguna tidak ditemukan",
      };
    }

    const passwordMatch = await compare(password, existingUser.password);

    if (!passwordMatch) {
      return {
        error: "Password salah",
      };
    }

    await createSession(existingUser.id, existingUser.username);
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    } else {
      return {
        error: "Something went wrong",
      };
    }
  }

  redirect("/");
}

export async function logOut() {
  await deleteSession();
  redirect("/login");
}

export const getAdmin = unstable_cache(async function getAdmin(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
});

export async function updateAdmin(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const oldPassword = formData.get("oldPassword") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const name = formData.get("name") as string;

  if (!name) {
    return {
      error: "Nama harus diisi",
    };
  }

  try {
    const session = await getSession();
    const existingUser = await getAdmin(session!.id);
    if (!existingUser) {
      return {
        error: "Admin tidak ditemukan",
      };
    }

    let currentPassword = existingUser.password;

    if (oldPassword && password && confirmPassword) {
      const passwordMatch = await compare(oldPassword, existingUser.password);

      if (!passwordMatch) {
        return {
          error: "Password lama salah",
        };
      }

      if (password.length < 6) {
        return {
          error: "Password harus memiliki minimal 6 karakter",
        };
      }

      if (password !== confirmPassword) {
        return {
          error: "Password dan Konfirmasi Password harus sama",
        };
      }

      currentPassword = await hash(password, 10);
    }

    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        password: currentPassword,
        name,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    } else {
      return {
        error: "Something went wrong",
      };
    }
  }

  revalidatePath("/settings");
  redirect("/settings?success=1&message=Profil berhasil diperbarui");
}
