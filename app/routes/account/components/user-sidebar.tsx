import { ChevronDown, HomeIcon, UserIcon } from "lucide-react";
import { href, Link, NavLink, useLocation } from "react-router";
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
        pathname: href("/dashboard"),
      },
      {
        title: "Wallet",
        icon: UserIcon,
        pathname: href("/wallet"),
      },
    ],
  },

  {
    label: "Management",
    group: [
      {
        title: "Airtime",
        icon: UserIcon,
        pathname: href("/airtime"),
      },
      {
        title: "Data",
        icon: UserIcon,
        pathname: href("/data"),
      },
      {
        title: "Crypto",
        icon: UserIcon,
        pathname: href("/crypto"),
      },
      {
        title: "Airline",
        icon: UserIcon,
        pathname: href("/airline"),
      },
      {
        title: "TV",
        icon: UserIcon,
        pathname: href("/cable"),
      },
      {
        title: "Gift Card",
        icon: UserIcon,
        pathname: href("/gift-card"),
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
