"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { IndianRupee, PieChart, RefreshCcw, CreditCard, Settings, HelpCircle, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}

const NavLink = ({ href, icon: Icon, children, className }: NavLinkProps) => {
  const pathname = usePathname();
  // You can adjust the matching logic for nested routes if needed.
  const isActive = pathname === href;

  // Define active styles – adjust these classes as desired.
  const activeClasses = isActive
    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50"
    : "";

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${className} ${activeClasses}`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
};

export function SideNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-full flex-col overflow-hidden border-r">
          <div className="p-4">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">FinTrack</h2>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-4">
                <NavLink
                  href="/"
                  icon={IndianRupee}
                  className="text-gray-900 hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50"
                >
                  Overview
                </NavLink>
                <NavLink
                  href="/protected/income"
                  icon={PieChart}
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  Income
                </NavLink>
                <NavLink
                  href="/protected/expenses"
                  icon={RefreshCcw}
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  Expenses
                </NavLink>
                <NavLink
                  href="/protected/investments"
                  icon={CreditCard}
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  Investments
                </NavLink>
                <NavLink
                  href="/protected/subscriptions"
                  icon={CreditCard}
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  Subscriptions
                </NavLink>
              </div>
              <div className="mt-6 pt-6 border-t">
                <NavLink
                  href="/protected/settings"
                  icon={Settings}
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  Settings
                </NavLink>
                <NavLink
                  href="/protected/help"
                  icon={HelpCircle}
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  Help
                </NavLink>
              </div>
            </ScrollArea>
          </div>
        </div>
      </aside>
    </>
  );
}
