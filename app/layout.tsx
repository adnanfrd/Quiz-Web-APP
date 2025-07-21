import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { cookies } from "next/headers"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quiz Software",
  description: "A web-based quiz system for student assessments.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <main className="flex-1 flex flex-col md:ml-[--sidebar-width] group-data-[collapsible=icon]:md:ml-[--sidebar-width-icon] transition-[margin-left] ease-linear">
            {children}
          </main>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  )
}
