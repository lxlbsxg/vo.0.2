import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vo.0.2",
  description: "Votely 网站规划 v0.1 — 积分模拟版",
};

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/publish", label: "发布 Chapter" },
  { href: "/portfolio", label: "我的持仓" },
  { href: "/review", label: "审核后台" },
  { href: "/register", label: "注册" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="mx-auto flex w-full max-w-4xl items-center gap-5 px-6 py-3 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
