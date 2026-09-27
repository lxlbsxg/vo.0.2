import { getCurrentAccount, registerOrLogin, logout } from "@/lib/actions/auth";

export default async function RegisterPage() {
  const account = await getCurrentAccount();

  if (account) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-12">
        <h1 className="text-2xl font-semibold">账户</h1>
        <div className="rounded border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <p>{account.name || account.email}</p>
          <p className="text-zinc-500">{account.email}</p>
          <p className="mt-2">积分：{account.points}</p>
          {account.person.isReviewer && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">审核员身份</p>
          )}
        </div>
        <form action={logout}>
          <button className="w-full rounded-full border border-zinc-300 px-5 py-2.5 dark:border-zinc-700">
            退出登录
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">注册 / 账户</h1>
      <p className="text-xs text-zinc-500">
        一个人最多 5 个账户，账户归属同一个&quot;人&quot;，计算人数时只算 1（MVP 简化：一个邮箱一个账户）。
      </p>
      <form action={registerOrLogin} className="flex flex-col gap-4">
        <input
          name="email"
          type="email"
          required
          placeholder="邮箱（已注册则直接登录）"
          className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          name="name"
          type="text"
          placeholder="昵称（可选）"
          className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          <input name="asReviewer" type="checkbox" />
          作为审核员注册（仅测试用途）
        </label>
        <button
          type="submit"
          className="rounded-full bg-black px-5 py-2.5 text-white dark:bg-white dark:text-black"
        >
          注册 / 登录
        </button>
      </form>
    </div>
  );
}
