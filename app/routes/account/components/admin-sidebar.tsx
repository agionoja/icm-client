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
import { href, Link, NavLink, useLocation } from "react-router";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

const data = [
  {
    label: null,
    items: [
      {
        title: "Dashboard",
        icon: HomeIcon,
        pathname: href("/admin/dashboard"),
      },
      {
        title: "Users",
        icon: UserIcon,
        pathname: href("/admin/users"),
      },
      {
        title: "Services",
        icon: UserIcon,
        pathname: href("/admin/services"),
      },
      {
        title: "Analytics",
        icon: UserIcon,
        pathname: href("/admin/analytics"),
      },
      {
        title: "Wallets",
        icon: UserIcon,
        pathname: href("/admin/wallets"),
      },
    ],
  },

  {
    label: "Management",
    items: [
      {
        title: "Airtime",
        icon: UserIcon,
        pathname: href("/admin/airtime"),
      },
      {
        title: "Data",
        icon: UserIcon,
        pathname: href("/admin/airline"),
      },
      {
        title: "Crypto",
        icon: UserIcon,
        pathname: href("/admin/crypto"),
      },
      {
        title: "Airline",
        icon: UserIcon,
        pathname: href("/admin/airline"),
      },
      {
        title: "TV",
        icon: UserIcon,
        pathname: href("/admin/tv"),
      },
      {
        title: "Gift Card",
        icon: UserIcon,
        pathname: href("/admin/gift-card"),
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
            {data[0].items.map((item, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.includes(item.pathname)}
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
              Management
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {data[1].items.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      isActive={location.pathname.includes(item.pathname)}
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
