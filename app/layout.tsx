import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'PromptVault – Universal AI Workspace',
  description:
    'Organize and manage your AI agents, prompts, images, markdown files, code snippets, workflows, and templates in one premium workspace.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-background text-text-main antialiased`}>
        {children}
      </body>
    </html>
  )
}
