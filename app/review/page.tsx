import { prisma } from "@/lib/prisma";

export default async function ReviewPage() {
  const [pendingCompanies, pendingMilestones] = await Promise.all([
    prisma.company.findMany({ where: { verification: "PENDING" } }),
    prisma.milestone.findMany({
      where: { verificationStatus: "PENDING" },
      include: { chapter: true },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold">审核后台</h1>

      <section>
        <h2 className="text-lg font-medium">待审企业</h2>
        <div className="mt-3 flex flex-col gap-2">
          {pendingCompanies.map((c) => (
            <ReviewRow key={c.id} label={c.name} />
          ))}
          {pendingCompanies.length === 0 && <p className="text-zinc-500">无待审企业</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium">待审节点文件</h2>
        <div className="mt-3 flex flex-col gap-2">
          {pendingMilestones.map((m) => (
            <ReviewRow key={m.id} label={`${m.chapter.title} — ${m.description}`} />
          ))}
          {pendingMilestones.length === 0 && <p className="text-zinc-500">无待审节点</p>}
        </div>
      </section>
    </div>
  );
}

function ReviewRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
      <span>{label}</span>
      <div className="flex gap-2">
        <button className="rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black" disabled>
          通过
        </button>
        <button className="rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700" disabled>
          驳回
        </button>
      </div>
    </div>
  );
}
