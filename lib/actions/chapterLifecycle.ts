import { prisma } from "@/lib/prisma";

export async function checkChapterDeadline(chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { holdings: true },
  });
  if (!chapter) return;

  const isOverdue = chapter.status === "IN_PROGRESS" && chapter.deadline.getTime() < Date.now();
  if (!isOverdue) return;

  await prisma.$transaction([
    ...chapter.holdings.map((h) =>
      prisma.account.update({
        where: { id: h.accountId },
        data: { points: { increment: h.amount } },
      })
    ),
    ...chapter.holdings.map((h) =>
      prisma.trade.create({
        data: {
          chapterId: chapter.id,
          type: "EXIT",
          sellerAccountId: h.accountId,
          amount: h.amount,
          price: h.amount,
          timeWeight: h.timeWeight,
        },
      })
    ),
    prisma.holding.deleteMany({ where: { chapterId: chapter.id } }),
    prisma.chapter.update({
      where: { id: chapter.id },
      data: { status: "FIRST_ROLL_FAILED" },
    }),
  ]);
}
