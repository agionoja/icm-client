import { adminRouteConfig } from "~/routes.config";
import { ChevronDown, HomeIcon, UserIcon } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Link, NavLink, useLocation } from "react-router";
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
        pathname: adminRouteConfig.dashboard.getPath,
      },
      {
        title: "Users",
        icon: UserIcon,
        pathname: adminRouteConfig.users.getPath,
      },
      {
        title: "Services",
        icon: UserIcon,
        pathname: adminRouteConfig.services.getPath,
      },
      {
        title: "Analytics",
        icon: UserIcon,
        pathname: adminRouteConfig.analytics.getPath,
      },
      {
        title: "Wallets",
        icon: UserIcon,
        pathname: adminRouteConfig.wallet.getPath,
      },
    ],
  },

  {
    label: "Management",
    group: [
      {
        title: "Airtime",
        icon: UserIcon,
        pathname: adminRouteConfig.airtime.getPath,
      },
      {
        title: "Data",
        icon: UserIcon,
        pathname: adminRouteConfig.data.getPath,
      },
      {
        title: "Crypto",
        icon: UserIcon,
        pathname: adminRouteConfig.crypto.getPath,
      },
      {
        title: "Airline",
        icon: UserIcon,
        pathname: adminRouteConfig.airline.getPath,
      },
      {
        title: "TV",
        icon: UserIcon,
        pathname: adminRouteConfig.tv.getPath,
      },
      {
        title: "Gift Card",
        icon: UserIcon,
        pathname: adminRouteConfig.giftCard.getPath,
      },
    ],
  },
];

export function AdminSidebar() {
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
                  <Link to={item.pathname}>
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
              Management
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
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
                      <NavLink to={item.pathname}>
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
