import {
  CirclePlusIcon,
  LayoutDashboardIcon,
  PackageIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@shared/config";

export interface NavigationItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  match: "exact" | "prefix";
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigation: NavigationGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        href: routes.dashboard,
        label: "Dashboard",
        Icon: LayoutDashboardIcon,
        match: "prefix",
      },
      {
        href: routes.shipments,
        label: "Shipments",
        Icon: PackageIcon,
        match: "prefix",
      },
      {
        href: routes.createShipment,
        label: "New shipment",
        Icon: CirclePlusIcon,
        match: "prefix",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        href: routes.profile,
        label: "Profile",
        Icon: UserRoundIcon,
        match: "prefix",
      },
    ],
  },
];

export const navigationItems = navigation.flatMap((group) => group.items);
