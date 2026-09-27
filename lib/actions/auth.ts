"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const ACCOUNT_COOKIE = "accountId";

export async function getCurrentAccount() {
  const store = await cookies();
  const accountId = store.get(ACCOUNT_COOKIE)?.value;
  if (!accountId) return null;
  return prisma.account.findUnique({
    where: { id: accountId },
    include: { person: true },
  });
}

export async function registerOrLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const asReviewer = formData.get("asReviewer") === "on";

  if (!email) throw new Error("邮箱不能为空");

  const existing = await prisma.account.findUnique({ where: { email } });

  const account = existing
    ? existing
    : await prisma.account.create({
        data: {
          email,
          name: name || null,
          person: {
            create: {
              name: name || null,
              isReviewer: asReviewer,
            },
          },
        },
      });

  const store = await cookies();
  store.set(ACCOUNT_COOKIE, account.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/");
}

export async function logout() {
  const store = await cookies();
  store.delete(ACCOUNT_COOKIE);
  redirect("/");
}
