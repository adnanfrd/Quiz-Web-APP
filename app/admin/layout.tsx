import type React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center h-14 px-4 border-b lg:h-20 dark:border-gray-800">
        <SidebarTrigger />
        <h1 className="ml-4 text-xl font-semibold">Admin Dashboard</h1>
      </header>
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  )
}
