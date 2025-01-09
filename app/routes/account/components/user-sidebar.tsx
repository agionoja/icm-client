import { ChevronDown, HomeIcon, UserIcon } from "lucide-react";
import { userRouteConfig } from "~/routes.config";
import { Link, NavLink, useLocation } from "react-router";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

const data = [
  {
    label: null,
    group: [
      {
        title: "Dashboard",
        icon: HomeIcon,
        pathname: userRouteConfig.dashboard.getPath,
      },
      {
        title: "Fund Wallet",
        icon: UserIcon,
        pathname: userRouteConfig.wallet.getPath,
      },
    ],
  },

  {
    label: "Management",
    group: [
      {
        title: "Airtime",
        icon: UserIcon,
        pathname: userRouteConfig.airtime.getPath,
      },
      {
        title: "Data",
        icon: UserIcon,
        pathname: userRouteConfig.data.getPath,
      },
      {
        title: "Crypto",
        icon: UserIcon,
        pathname: userRouteConfig.crypto.getPath,
      },
      {
        title: "Airline",
        icon: UserIcon,
        pathname: userRouteConfig.airline.getPath,
      },
      {
        title: "TV",
        icon: UserIcon,
        pathname: userRouteConfig.cable.getPath,
      },
      {
        title: "Gift Card",
        icon: UserIcon,
        pathname: userRouteConfig.giftCard.getPath,
      },
    ],
  },
];

export function UserSidebar() {
  const location = useLocation();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {data[0].group.map((item, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.pathname}
                >
                  <Link prefetch={"intent"} to={item.pathname}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger>
              Services
              <ChevronDown
                className={
                  "ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                }
              />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {data[1].group.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      isActive={location.pathname === item.pathname}
                      asChild
                    >
                      <NavLink prefetch={"intent"} to={item.pathname}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </SidebarContent>
  );
}
