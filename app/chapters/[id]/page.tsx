import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcInfoValue, calcMedian } from "@/lib/rules";
import { getCurrentAccount } from "@/lib/actions/auth";
import { buy, exitHolding, resell } from "@/lib/actions/trade";
import { checkChapterDeadline } from "@/lib/actions/chapterLifecycle";

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await checkChapterDeadline(id);

  const [chapter, account] = await Promise.all([
    prisma.chapter.findUnique({
      where: { id },
      include: {
        company: true,
        milestones: { orderBy: { plannedAnnounceAt: "asc" } },
        holdings: true,
      },
    }),
    getCurrentAccount(),
  ]);

  if (!chapter) notFound();

  const headcount = new Set(chapter.holdings.map((h) => h.accountId)).size;
  const medianFunding = calcMedian(chapter.holdings.map((h) => h.amount));
  const infoValue = calcInfoValue(headcount, medianFunding);
  const myHoldings = account
    ? chapter.holdings.filter((h) => h.accountId === account.id)
    : [];
  const canBuy = chapter.status === "IN_PROGRESS" || chapter.status === "SECOND_ROLL_IN_PROGRESS";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">{chapter.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{chapter.company.name}</p>
      </div>

      <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
        {chapter.body}
      </p>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-4">
        <Stat label="当前状态" value={chapter.status} />
        <Stat label="信息值" value={infoValue.toFixed(1)} />
        <Stat label="人数" value={String(headcount)} />
        <Stat label="资金中位数" value={medianFunding.toFixed(0)} />
      </div>

      <div>
        <h2 className="text-lg font-medium">进度节点</h2>
        <ol className="mt-3 flex flex-col gap-2">
          {chapter.milestones.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <span>
                {m.description}
                {m.isDecisiveVictory && (
                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    决定性胜利
                  </span>
                )}
              </span>
              <span className="text-zinc-500">{m.verificationStatus}</span>
            </li>
          ))}
          {chapter.milestones.length === 0 && (
            <p className="text-zinc-500">暂无节点</p>
          )}
        </ol>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>期限：{chapter.deadline.toLocaleDateString(undefined, { timeZone: "UTC" })}</span>
        <span>剩余修改次数：{chapter.remainingEdits}</span>
      </div>

      {!account && (
        <p className="text-sm text-zinc-500">
          请先<a href="/register" className="underline">注册 / 登录</a>后买入。
        </p>
      )}

      {account && canBuy && (
        <form action={buy} className="flex items-end gap-3">
          <input type="hidden" name="chapterId" value={chapter.id} />
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              买入数量（当前积分：{account.points}）
            </span>
            <input
              name="amount"
              type="number"
              min={1}
              step={1}
              required
              className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <button className="rounded-full bg-black px-5 py-2.5 text-white dark:bg-white dark:text-black">
            买入
          </button>
        </form>
      )}

      {account && !canBuy && (
        <p className="text-sm text-zinc-500">该 Chapter 当前状态不可买入。</p>
      )}

      {account && myHoldings.length > 0 && (
        <div>
          <h2 className="text-lg font-medium">我在本 Chapter 的持仓</h2>
          <div className="mt-3 flex flex-col gap-3">
            {myHoldings.map((h) => (
              <div
                key={h.id}
                className="flex flex-col gap-2 rounded border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>数量：{h.amount}</span>
                  <span>阶段：{h.purchaseStage}</span>
                  <span>时间权重：{h.timeWeight.toFixed(2)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={exitHolding}>
                    <input type="hidden" name="holdingId" value={h.id} />
                    <button className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs dark:border-zinc-700">
                      退出（全额退回）
                    </button>
                  </form>
                  <form action={resell} className="flex items-center gap-2">
                    <input type="hidden" name="holdingId" value={h.id} />
                    <input
                      name="recipientEmail"
                      type="email"
                      placeholder="转卖给（邮箱）"
                      required
                      className="rounded border border-zinc-300 p-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                    />
                    <input
                      name="price"
                      type="number"
                      min={1}
                      placeholder="价格"
                      required
                      className="w-20 rounded border border-zinc-300 p-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                    />
                    <button className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs dark:border-zinc-700">
                      转卖
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="truncate text-lg font-medium" title={value}>
        {value}
      </p>
    </div>
  );
}
