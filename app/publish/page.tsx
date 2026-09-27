export default function PublishPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">企业发布流程</h1>
      <form className="flex flex-col gap-4">
        <Field label="信息正文 / 资金用途说明">
          <textarea className="w-full rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950" rows={4} />
        </Field>
        <Field label="进度节点（含决定性胜利标记）">
          <textarea className="w-full rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950" rows={3} placeholder="逐条列出节点，标明哪个是决定性胜利" />
        </Field>
        <Field label="期限">
          <input type="date" className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950" />
        </Field>
        <Field label="审核文件">
          <input type="file" className="text-sm" />
        </Field>
        <p className="text-xs text-zinc-500">
          任何影响市场走向的更新必须提前 24 小时排期发布。
        </p>
        <button
          type="submit"
          className="mt-2 rounded-full bg-black px-5 py-2.5 text-white dark:bg-white dark:text-black"
          disabled
        >
          提交审核
        </button>
      </form>
    </div>
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
