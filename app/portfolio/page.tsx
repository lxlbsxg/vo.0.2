export default function PortfolioPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">我的持仓</h1>
      <p className="text-zinc-500">
        每个 Chapter 的持有量、时间权重、当前价值、已分配的 20%、兑现记录 — 待登录后接入真实数据。
      </p>
    </div>
  );
}
