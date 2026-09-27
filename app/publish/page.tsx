import Link from "next/link";
import { getCurrentAccount } from "@/lib/actions/auth";
import { createCompany } from "@/lib/actions/company";
import { prisma } from "@/lib/prisma";
import { ChapterForm } from "./ChapterForm";

export default async function PublishPage() {
  const account = await getCurrentAccount();

  if (!account) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold">企业发布流程</h1>
        <p className="text-zinc-500">
          请先<Link href="/register" className="underline">注册 / 登录</Link>。
        </p>
      </div>
    );
  }

  const company = await prisma.company.findFirst({
    where: { ownerId: account.personId },
    orderBy: { createdAt: "desc" },
  });

  if (!company) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="text-2xl font-semibold">先创建企业 / 团队</h1>
        <form action={createCompany} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">企业名称</span>
            <input
              name="name"
              required
              className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">企业介绍</span>
            <textarea
              name="description"
              required
              rows={4}
              className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-full bg-black px-5 py-2.5 text-white dark:bg-white dark:text-black"
          >
            创建企业（待审核）
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">企业发布流程</h1>
        <p className="mt-1 text-sm text-zinc-500">
          以 {company.name} 发布（认证状态：{company.verification}）
        </p>
      </div>
      <ChapterForm />
    </div>
  );
}
