import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcInfoValue, calcMedian } from "@/lib/rules";

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      company: true,
      milestones: { orderBy: { plannedAnnounceAt: "asc" } },
      holdings: true,
    },
  });

  if (!chapter) notFound();

  const headcount = new Set(chapter.holdings.map((h) => h.accountId)).size;
  const medianFunding = calcMedian(chapter.holdings.map((h) => h.amount));
  const infoValue = calcInfoValue(headcount, medianFunding);

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
        <span>期限：{chapter.deadline.toLocaleDateString()}</span>
        <span>剩余修改次数：{chapter.remainingEdits}</span>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 rounded-full bg-black px-5 py-2.5 text-white dark:bg-white dark:text-black">
          买入
        </button>
        <button className="flex-1 rounded-full border border-zinc-300 px-5 py-2.5 dark:border-zinc-700">
          退出
        </button>
        <button className="flex-1 rounded-full border border-zinc-300 px-5 py-2.5 dark:border-zinc-700">
          转卖
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}
