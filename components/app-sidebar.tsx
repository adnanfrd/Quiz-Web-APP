"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, PlusCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const pathname = usePathname()

  // Hide sidebar on quiz pages
  if (pathname.startsWith("/quiz/")) {
    return null;
  }

  const adminItems = [
    {
      title: "Dashboard",
      url: "/", // Changed from /admin
      icon: LayoutDashboard,
    },
    {
      title: "Create Quiz",
      url: "/quizzes/new", // Changed from /admin/quizzes/new
      icon: PlusCircle,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 p-2 text-lg font-semibold">
          {" "}
          {/* Changed from /admin */}
          <span className="sr-only">Quiz Admin</span>
          <LayoutDashboard className="h-6 w-6" />
          <span>Quiz Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
