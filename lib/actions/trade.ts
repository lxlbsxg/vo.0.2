"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/actions/auth";
import { RULES_CONFIG } from "@/lib/rules";

export async function buy(formData: FormData) {
  const account = await getCurrentAccount();
  if (!account) throw new Error("请先登录");

  const chapterId = String(formData.get("chapterId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  if (!chapterId || amount <= 0) throw new Error("买入数量必须大于 0");

  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) throw new Error("Chapter 不存在");
  if (chapter.status === "FIRST_ROLL_FAILED" || chapter.status === "ENDED") {
    throw new Error("该 Chapter 已结束，无法买入");
  }
  if (account.points < amount) throw new Error("积分不足");

  const stage = chapter.status === "SECOND_ROLL_IN_PROGRESS" ? "SECOND_ROLL" : "FIRST_ROLL";

  await prisma.$transaction([
    prisma.account.update({
      where: { id: account.id },
      data: { points: { decrement: amount } },
    }),
    prisma.holding.create({
      data: {
        accountId: account.id,
        chapterId: chapter.id,
        amount,
        purchaseStage: stage,
        timeWeight: RULES_CONFIG.timeWeight.startWeight,
      },
    }),
    prisma.trade.create({
      data: {
        chapterId: chapter.id,
        type: "BUY",
        buyerAccountId: account.id,
        amount,
        price: amount,
        timeWeight: RULES_CONFIG.timeWeight.startWeight,
      },
    }),
  ]);

  revalidatePath(`/chapters/${chapterId}`);
  revalidatePath("/portfolio");
}

export async function exitHolding(formData: FormData) {
  const account = await getCurrentAccount();
  if (!account) throw new Error("请先登录");

  const holdingId = String(formData.get("holdingId") ?? "");
  const holding = await prisma.holding.findUnique({ where: { id: holdingId } });
  if (!holding || holding.accountId !== account.id) throw new Error("持仓不存在");

  await prisma.$transaction([
    prisma.account.update({
      where: { id: account.id },
      data: { points: { increment: holding.amount } },
    }),
    prisma.trade.create({
      data: {
        chapterId: holding.chapterId,
        type: "EXIT",
        sellerAccountId: account.id,
        amount: holding.amount,
        price: holding.amount,
        timeWeight: holding.timeWeight,
      },
    }),
    prisma.holding.delete({ where: { id: holding.id } }),
  ]);

  revalidatePath(`/chapters/${holding.chapterId}`);
  revalidatePath("/portfolio");
}

export async function resell(formData: FormData) {
  const account = await getCurrentAccount();
  if (!account) throw new Error("请先登录");

  const holdingId = String(formData.get("holdingId") ?? "");
  const recipientEmail = String(formData.get("recipientEmail") ?? "").trim().toLowerCase();
  const price = Number(formData.get("price") ?? 0);

  const holding = await prisma.holding.findUnique({ where: { id: holdingId } });
  if (!holding || holding.accountId !== account.id) throw new Error("持仓不存在");
  if (price <= 0) throw new Error("价格必须大于 0");

  const recipient = await prisma.account.findUnique({ where: { email: recipientEmail } });
  if (!recipient) throw new Error("找不到该邮箱对应的账户");
  if (recipient.id === account.id) throw new Error("不能转卖给自己");
  if (recipient.points < price) throw new Error("对方积分不足");

  await prisma.$transaction([
    prisma.account.update({
      where: { id: recipient.id },
      data: { points: { decrement: price } },
    }),
    prisma.account.update({
      where: { id: account.id },
      data: { points: { increment: price } },
    }),
    prisma.holding.update({
      where: { id: holding.id },
      data: { accountId: recipient.id },
    }),
    prisma.trade.create({
      data: {
        chapterId: holding.chapterId,
        holdingId: holding.id,
        type: "RESELL",
        sellerAccountId: account.id,
        buyerAccountId: recipient.id,
        amount: holding.amount,
        price,
        timeWeight: holding.timeWeight,
      },
    }),
  ]);

  revalidatePath(`/chapters/${holding.chapterId}`);
  revalidatePath("/portfolio");
}
