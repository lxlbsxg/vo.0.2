import Link from "next/link";
import { getCurrentAccount } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";

export default async function PortfolioPage() {
  const account = await getCurrentAccount();

  if (!account) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold">我的持仓</h1>
        <p className="text-zinc-500">
          请先<Link href="/register" className="underline">注册 / 登录</Link>。
        </p>
      </div>
    );
  }

  const holdings = await prisma.holding.findMany({
    where: { accountId: account.id },
    include: { chapter: { include: { company: true } } },
    orderBy: { purchasedAt: "desc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">我的持仓</h1>
      <p className="text-sm text-zinc-500">当前积分：{account.points}</p>

      <div className="flex flex-col gap-3">
        {holdings.map((h) => (
          <Link
            key={h.id}
            href={`/chapters/${h.chapterId}`}
            className="rounded border border-zinc-200 p-4 text-sm dark:border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{h.chapter.title}</span>
              <span className="text-zinc-500">{h.chapter.company.name}</span>
            </div>
            <div className="mt-2 flex justify-between text-zinc-500">
              <span>数量：{h.amount}</span>
              <span>阶段：{h.purchaseStage}</span>
              <span>时间权重：{h.timeWeight.toFixed(2)}</span>
            </div>
          </Link>
        ))}
        {holdings.length === 0 && <p className="text-zinc-500">暂无持仓</p>}
      </div>
    </div>
  );
}
