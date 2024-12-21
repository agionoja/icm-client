// import {
//   Calendar,
//   Home,
//   Inbox,
//   LayoutDashboardIcon,
//   Search,
//   Settings,
//   WalletIcon,
// } from "lucide-react";
//
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "~/components/ui/sidebar";
//
// // Menu items.
// const items = [
//   {
//     title: "Dashboard",
//     url: "#",
//     icon: Home,
//   },
//   {
//     title: "Fund Wallet",
//     url: "#",
//     icon: WalletIcon,
//   },
//   {
//     title: "Transactions",
//     url: "#",
//     icon: WalletIcon,
//   },
//   {
//     title: "Airtime",
//     url: "#",
//     icon: LayoutDashboardIcon,
//   },
//   {
//     title: "Data",
//     url: "#",
//     icon: LayoutDashboardIcon,
//   },
//   {
//     title: "Gift card",
//     url: "#",
//     icon: LayoutDashboardIcon,
//   },
//   {
//     title: "Airline booking",
//     url: "#",
//     icon: LayoutDashboardIcon,
//   },
//   {
//     title: "Cable subscription",
//     url: "#",
//     icon: LayoutDashboardIcon,
//   },
//   {
//     title: "Exchange crypto",
//     url: "#",
//     icon: LayoutDashboardIcon,
//   },
//   {
//     title: "Inbox",
//     url: "#",
//     icon: Inbox,
//   },
//   {
//     title: "Calendar",
//     url: "#",
//     icon: Calendar,
//   },
//   {
//     title: "Search",
//     url: "#",
//     icon: Search,
//   },
//   {
//     title: "Settings",
//     url: "#",
//     icon: Settings,
//   },
//   {
//     title: "Support",
//     url: "#",
//     icon: Settings,
//   },
//   {
//     title: "Log out",
//     url: "#",
//     icon: Settings,
//   },
// ];
//
// export function AppSidebar() {
//   return (
//     <Sidebar>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {items.map((item, index) => (
//                 <SidebarMenuItem key={index}>
//                   <SidebarMenuButton asChild>
//                     <a href={item.url}>
//                       <item.icon />
//                       <span>{item.title}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>{" "}
//         <SidebarGroup>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {items.map((item, index) => (
//                 <SidebarMenuItem key={index}>
//                   <SidebarMenuButton asChild>
//                     <a href={item.url}>
//                       <item.icon />
//                       <span>{item.title}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// }
