// app/layout.tsx

export const metadata = {
  title: "标签管理器 - 智能数字书签系统",
  description: "一个帮助你智能管理数字书签与标签的小工具",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
