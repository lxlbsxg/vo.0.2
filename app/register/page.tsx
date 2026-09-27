export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">注册 / 账户</h1>
      <p className="text-xs text-zinc-500">
        一个人最多 5 个账户，账户归属同一个&quot;人&quot;，计算人数时只算 1。
      </p>
      <form className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="邮箱"
          className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          className="rounded-full bg-black px-5 py-2.5 text-white dark:bg-white dark:text-black"
          disabled
        >
          注册
        </button>
      </form>
    </div>
  );
}
