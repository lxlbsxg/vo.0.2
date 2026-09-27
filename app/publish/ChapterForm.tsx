"use client";

import { useState } from "react";
import { createChapter } from "@/lib/actions/chapter";

type MilestoneRow = { key: number; description: string; decisive: boolean; date: string };

let nextKey = 1;

export function ChapterForm() {
  const [milestones, setMilestones] = useState<MilestoneRow[]>([
    { key: nextKey++, description: "", decisive: false, date: "" },
  ]);
  const [error, setError] = useState<string | null>(null);

  function addRow() {
    setMilestones((rows) => [...rows, { key: nextKey++, description: "", decisive: false, date: "" }]);
  }

  function removeRow(key: number) {
    setMilestones((rows) => rows.filter((r) => r.key !== key));
  }

  function updateRow(key: number, patch: Partial<MilestoneRow>) {
    setMilestones((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  async function action(formData: FormData) {
    setError(null);
    try {
      await createChapter(formData);
    } catch (e) {
      const digest = (e as { digest?: string })?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
        throw e;
      }
      setError(e instanceof Error ? e.message : "提交失败");
    }
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="信息正文 / 资金用途说明">
        <textarea
          name="body"
          required
          rows={4}
          className="w-full rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </Field>
      <Field label="标题">
        <input
          name="title"
          required
          className="w-full rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          进度节点（标明哪个是决定性胜利）
        </span>
        {milestones.map((row) => (
          <div key={row.key} className="flex flex-wrap items-center gap-2 rounded border border-zinc-200 p-2 dark:border-zinc-800">
            <input
              name="milestoneDescription"
              placeholder="节点描述"
              value={row.description}
              onChange={(e) => updateRow(row.key, { description: e.target.value })}
              className="min-w-[180px] flex-1 rounded border border-zinc-300 p-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="milestoneDate"
              type="date"
              value={row.date}
              onChange={(e) => updateRow(row.key, { date: e.target.value })}
              className="rounded border border-zinc-300 p-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <label className="flex items-center gap-1 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={row.decisive}
                onChange={(e) => updateRow(row.key, { decisive: e.target.checked })}
              />
              决定性胜利
            </label>
            <input type="hidden" name="milestoneDecisive" value={row.decisive ? "true" : "false"} />
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="text-xs text-zinc-400 hover:text-red-500"
            >
              删除
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="self-start text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          + 添加节点
        </button>
      </div>

      <Field label="期限">
        <input
          name="deadline"
          type="date"
          required
          className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </Field>

      <p className="text-xs text-zinc-500">
        任何影响市场走向的更新必须提前 24 小时排期发布（后续阶段实现）。
      </p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        className="mt-2 rounded-full bg-black px-5 py-2.5 text-white dark:bg-white dark:text-black"
      >
        提交 Chapter
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
