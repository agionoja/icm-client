import { type IUser, Role } from "icm-shared";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProps,
} from "~/components/ui/sidebar";
import { UserSidebar } from "~/routes/account/components/user-sidebar";
import { AdminSidebar } from "~/routes/account/components/admin-sidebar";
import logo from "~/assets/logos/svg/logo-mark-white.svg";
import { Form, Link, useLocation } from "react-router";
import {
  authRouteConfig,
  landingRouteConfig,
  settingsRouteConfig,
} from "~/routes.config";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import avatar from "~/routes/account/assets/avatar.svg";
import { AvatarIcon } from "~/components/icons";

export function AppSidebar({
  user: { role, ...restUser },
  ...props
}: {
  user: Pick<IUser, "role"> & NavUserProps;
} & SidebarProps) {
  return (
    <Sidebar {...props}>
      <AppSidebarHeader />
      {role === Role.ADMIN ? <AdminSidebar /> : <UserSidebar />}
      <AppSidebarFooter {...restUser} />
    </Sidebar>
  );
}

function AppSidebarFooter({ ...navUserProps }: NavUserProps) {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <Form method="POST" action={authRouteConfig.logout.getPath}>
            <SidebarMenuButton asChild>
              <button type={"submit"} className={"w-full"}>
                <LogOutIcon />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </Form>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to={"#"} prefetch={"intent"}>
              <SettingsIcon />
              <span>Support</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <NavUser {...navUserProps} />
      </SidebarMenu>
    </SidebarFooter>
  );
}

function AppSidebarHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link prefetch={"intent"} to={landingRouteConfig.home.getPath}>
              <img src={logo} height={30} width={20} alt="ICM Logo" />
              <span>ICM Tech.</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

type NavUserProps = Pick<IUser, "email" | "firstname" | "photo" | "lastname">;

function NavUser({ email, firstname, lastname, photo }: NavUserProps) {
  const location = useLocation();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={location.pathname.includes(settingsRouteConfig.route.getPath)}
        size={"lg"}
        className={
          "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        }
      >
        <Link prefetch={"intent"} to={settingsRouteConfig.route.getPath}>
          <Avatar className={"h-8 w-8 rounded-lg"}>
            <AvatarImage src={photo?.url || avatar} alt={firstname} />
            <AvatarFallback className={"rounded-lg uppercase"}>
              {`${firstname.charAt(0)}${lastname.charAt(0)}`} <AvatarIcon />
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{firstname}</span>
            <span className="truncate text-xs">{email}</span>
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
