"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/actions/auth";

export async function createCompany(formData: FormData) {
  const account = await getCurrentAccount();
  if (!account) throw new Error("请先登录");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name || !description) throw new Error("企业名称和介绍不能为空");

  await prisma.company.create({
    data: {
      ownerId: account.personId,
      name,
      description,
    },
  });

  redirect("/publish");
}
