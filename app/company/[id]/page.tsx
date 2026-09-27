import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: { chapters: true },
  });

  if (!company) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">{company.name}</h1>
        <span className="mt-1 inline-block text-xs text-zinc-500">
          认证状态：{company.verification}
        </span>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          {company.description}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium">全部 Chapter 记录</h2>
        <div className="mt-3 flex flex-col gap-2">
          {company.chapters.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <span>{c.title}</span>
              <span className="text-zinc-500">{c.status}</span>
            </div>
          ))}
          {company.chapters.length === 0 && (
            <p className="text-zinc-500">暂无 Chapter</p>
          )}
        </div>
      </div>
    </div>
  );
}
