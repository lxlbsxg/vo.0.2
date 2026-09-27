"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/actions/auth";

async function requireReviewer() {
  const account = await getCurrentAccount();
  if (!account || !account.person.isReviewer) throw new Error("仅审核员可操作");
  return account;
}

export async function approveCompany(formData: FormData) {
  await requireReviewer();
  const id = String(formData.get("companyId") ?? "");
  await prisma.company.update({ where: { id }, data: { verification: "VERIFIED" } });
  revalidatePath("/review");
}

export async function rejectCompany(formData: FormData) {
  await requireReviewer();
  const id = String(formData.get("companyId") ?? "");
  await prisma.company.update({ where: { id }, data: { verification: "REJECTED" } });
  revalidatePath("/review");
}

export async function approveMilestone(formData: FormData) {
  await requireReviewer();
  const id = String(formData.get("milestoneId") ?? "");

  const milestone = await prisma.milestone.update({
    where: { id },
    data: { verificationStatus: "VERIFIED", verifiedAt: new Date() },
  });

  if (milestone.isDecisiveVictory) {
    await prisma.chapter.update({
      where: { id: milestone.chapterId },
      data: { status: "SECOND_ROLL_IN_PROGRESS" },
    });
  }

  revalidatePath("/review");
  revalidatePath(`/chapters/${milestone.chapterId}`);
}

export async function rejectMilestone(formData: FormData) {
  await requireReviewer();
  const id = String(formData.get("milestoneId") ?? "");
  const milestone = await prisma.milestone.update({
    where: { id },
    data: { verificationStatus: "REJECTED" },
  });
  revalidatePath("/review");
  revalidatePath(`/chapters/${milestone.chapterId}`);
}
