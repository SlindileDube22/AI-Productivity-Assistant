import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  NotebookText,
  ListChecks,
  Lightbulb,
  MessageSquare,
  Compass,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const tools = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Meeting Summarizer", url: "/meeting", icon: NotebookText },
  { title: "Task Planner", url: "/tasks", icon: ListChecks },
  { title: "Research Assistant", url: "/research", icon: Lightbulb },
  { title: "Chatbot", url: "/chat", icon: MessageSquare },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-base font-semibold">Atlas</span>
            <span className="text-xs text-muted-foreground">Workplace AI</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((t) => (
                <SidebarMenuItem key={t.url}>
                  <SidebarMenuButton asChild isActive={pathname === t.url} tooltip={t.title}>
                    <Link to={t.url}>
                      <t.icon />
                      <span>{t.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="px-2 py-1 text-[11px] leading-relaxed text-muted-foreground group-data-[collapsible=icon]:hidden">
          AI output should be reviewed before use in business decisions.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}