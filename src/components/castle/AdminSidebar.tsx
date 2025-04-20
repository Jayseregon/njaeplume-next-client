"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  PanelLeftIcon,
  Users,
  LucideIcon,
  Cat,
  PackagePlus,
} from "lucide-react";
import { createContext, useContext, useState } from "react";

import { cn } from "@/src/lib/utils";
import { siteConfig } from "@/src/config/site";

// Create a context to share the sidebar state
type AdminSidebarContextType = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

const AdminSidebarContext = createContext<AdminSidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
});

export const useAdminSidebar = () => useContext(AdminSidebarContext);

export function AdminSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <AdminSidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function AdminSidebarTrigger() {
  const { toggleSidebar } = useAdminSidebar();

  return (
    <button
      className="h-8 w-8 rounded-md p-0 flex items-center justify-center hover:bg-muted"
      onClick={toggleSidebar}>
      <PanelLeftIcon className="h-4 w-4" />
    </button>
  );
}

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  Users: Users,
  Package: Package,
  Cat: Cat,
  PackagePlus: PackagePlus,
};

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed } = useAdminSidebar();

  return (
    <div
      className={cn(
        "h-full border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2
          className={cn(
            "font-semibold truncate",
            isCollapsed && "text-center"
          )}>
          <AdminSidebarTrigger />
        </h2>
      </div>

      {/* Navigation */}
      <div className="p-2">
        <nav className="space-y-1">
          {siteConfig.castleNavItems.map((item) => {
            const Icon = iconMap[item.icon];

            return (
              <Link
                key={item.key}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
                href={item.href}>
                {isCollapsed ? (
                  <Icon className="h-5 w-5" />
                ) : (
                  <span className="flex gap-4">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
