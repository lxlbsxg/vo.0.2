"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/actions/auth";

export async function createChapter(formData: FormData) {
  const account = await getCurrentAccount();
  if (!account) throw new Error("请先登录");

  const company = await prisma.company.findFirst({
    where: { ownerId: account.personId },
    orderBy: { createdAt: "desc" },
  });
  if (!company) throw new Error("请先创建企业");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const deadlineRaw = String(formData.get("deadline") ?? "");
  if (!title || !body || !deadlineRaw) throw new Error("信息不完整");

  const descriptions = formData.getAll("milestoneDescription").map(String);
  const decisiveFlags = formData.getAll("milestoneDecisive").map(String);
  const dates = formData.getAll("milestoneDate").map(String);

  const milestones = descriptions
    .map((description, i) => ({
      description: description.trim(),
      isDecisiveVictory: decisiveFlags[i] === "true",
      plannedAnnounceAt: dates[i] ? new Date(dates[i]) : null,
    }))
    .filter((m) => m.description && m.plannedAnnounceAt);

  if (milestones.length === 0) throw new Error("至少填写一个进度节点");
  if (!milestones.some((m) => m.isDecisiveVictory)) {
    throw new Error("必须标记一个节点为决定性胜利");
  }

  const chapter = await prisma.chapter.create({
    data: {
      companyId: company.id,
      title,
      body,
      deadline: new Date(deadlineRaw),
      milestones: {
        create: milestones.map((m) => ({
          description: m.description,
          isDecisiveVictory: m.isDecisiveVictory,
          plannedAnnounceAt: m.plannedAnnounceAt as Date,
        })),
      },
    },
  });

  redirect(`/chapters/${chapter.id}`);
}
