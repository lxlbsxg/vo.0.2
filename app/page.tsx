import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const chapters = await prisma.chapter.findMany({
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          正在进行的 Chapter
        </h1>

        <div className="mt-4 flex gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700">
            按信息值
          </span>
          <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700">
            按阶段
          </span>
          <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700">
            按行业
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {chapters.length === 0 && (
            <p className="text-zinc-500">暂无 Chapter，去发布第一个。</p>
          )}
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/chapters/${chapter.id}`}
              className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-black dark:text-zinc-50">
                  {chapter.title}
                </h2>
                <span className="text-xs text-zinc-500">{chapter.status}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{chapter.company.name}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
