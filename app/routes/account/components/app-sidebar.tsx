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
import logo from "~/assets/logos/svg/Logo Mark - White.svg";
import { Form, Link, useSubmit } from "react-router";
import {
  authRouteConfig,
  landingRouteConfig,
  RoutesConfig,
  settingsRouteConfig,
} from "~/routes.config";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import avatar from "~/routes/account/assets/avatar.png";
import { AvatarIcon } from "~/components/icons";

export function AppSidebar({
  user,
  ...props
}: {
  user: Pick<IUser, "role"> & NavUserProps;
} & SidebarProps) {
  return (
    <Sidebar {...props}>
      <AppSidebarHeader />
      {user.role === Role.ADMIN ? <AdminSidebar /> : <UserSidebar />}
      <SidebarFooter>
        <AppSidebarFooter
          firstname={user.firstname}
          photo={user.photo}
          lastname={user.lastname}
          email={user.email}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

function AppSidebarFooter({ ...navUserProps }: NavUserProps) {
  const submit = useSubmit();
  const handleLogout = () => {
    return submit(null, {
      method: "POST",
      action: authRouteConfig.logout.getPath,
    });
  };
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            // name={"_action"}
            // value={authRouteConfig.logout.getPath}
          >
            <button onClick={handleLogout} type={"submit"}>
              <LogOutIcon />
              <span>Logout</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to={"#"}>
              <SettingsIcon />
              <span>Support</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <NavUser {...navUserProps} />
    </SidebarFooter>
  );
}

function AppSidebarHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to={landingRouteConfig.home.getPath}>
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
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size={"lg"}
          className={
            "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          }
        >
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
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
