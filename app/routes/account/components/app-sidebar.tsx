import { Role } from "icm-shared";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  type SidebarProps,
} from "~/components/ui/sidebar";
import { UserSidebar } from "~/routes/account/components/user-sidebar";
import { AdminSidebar } from "~/routes/account/components/admin-sidebar";

export function AppSidebar({ role, ...props }: { role: Role } & SidebarProps) {
  return (
    <Sidebar collapsible={"offcanvas"} {...props}>
      <SidebarHeader></SidebarHeader>
      {role === Role.ADMIN ? <AdminSidebar /> : <UserSidebar />}
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
