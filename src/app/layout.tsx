import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FirstDraft - 把一个模糊的想法，变成真实存在的第一稿",
  description: "Turn your first idea into something real. AI驱动的产品页面生成器，几分钟内生成可分享的产品页面。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
