/**
 * The namespace object lives outside of `sidebar.tsx` on purpose: that module is
 * a `"use client"` boundary, and a server component cannot read properties off
 * an object exported from one — every part has to be its own client reference.
 */
import {
  SidebarCard,
  SidebarContent,
  SidebarDecoration,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRoot,
  SidebarSeparator,
  SidebarText,
  SidebarTrigger,
} from "./sidebar";

export const Sidebar = {
  Provider: SidebarProvider,
  Root: SidebarRoot,
  Card: SidebarCard,
  Decoration: SidebarDecoration,
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  GroupLabel: SidebarGroupLabel,
  Menu: SidebarMenu,
  MenuItem: SidebarMenuItem,
  MenuButton: SidebarMenuButton,
  Text: SidebarText,
  Separator: SidebarSeparator,
  Trigger: SidebarTrigger,
  Inset: SidebarInset,
};
