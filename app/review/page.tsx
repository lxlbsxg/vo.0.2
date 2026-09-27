import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/actions/auth";
import { approveCompany, rejectCompany, approveMilestone, rejectMilestone } from "@/lib/actions/review";

export default async function ReviewPage() {
  const account = await getCurrentAccount();

  if (!account) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold">审核后台</h1>
        <p className="text-zinc-500">
          请先<Link href="/register" className="underline">注册 / 登录</Link>。
        </p>
      </div>
    );
  }

  if (!account.person.isReviewer) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold">审核后台</h1>
        <p className="text-zinc-500">
          当前账户不是审核员。可在注册页勾选&quot;作为审核员注册&quot;创建一个审核员账户用于测试。
        </p>
      </div>
    );
  }

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
            <ReviewRow
              key={c.id}
              label={c.name}
              hiddenName="companyId"
              hiddenValue={c.id}
              approveAction={approveCompany}
              rejectAction={rejectCompany}
            />
          ))}
          {pendingCompanies.length === 0 && <p className="text-zinc-500">无待审企业</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium">待审节点文件</h2>
        <div className="mt-3 flex flex-col gap-2">
          {pendingMilestones.map((m) => (
            <ReviewRow
              key={m.id}
              label={`${m.chapter.title} — ${m.description}${m.isDecisiveVictory ? "（决定性胜利）" : ""}`}
              hiddenName="milestoneId"
              hiddenValue={m.id}
              approveAction={approveMilestone}
              rejectAction={rejectMilestone}
            />
          ))}
          {pendingMilestones.length === 0 && <p className="text-zinc-500">无待审节点</p>}
        </div>
      </section>
    </div>
  );
}

function ReviewRow({
  label,
  hiddenName,
  hiddenValue,
  approveAction,
  rejectAction,
}: {
  label: string;
  hiddenName: string;
  hiddenValue: string;
  approveAction: (formData: FormData) => Promise<void>;
  rejectAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
      <span>{label}</span>
      <div className="flex gap-2">
        <form action={approveAction}>
          <input type="hidden" name={hiddenName} value={hiddenValue} />
          <button className="rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black">
            通过
          </button>
        </form>
        <form action={rejectAction}>
          <input type="hidden" name={hiddenName} value={hiddenValue} />
          <button className="rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700">
            驳回
          </button>
        </form>
      </div>
    </div>
  );
}
