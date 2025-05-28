import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '常用网站',
  description: 'Created with v0',
  generator: '常用网站',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
