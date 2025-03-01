"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IndianRupee,
  RefreshCcw,
  CreditCard,
  Settings,
  HelpCircle,
  TrendingUp,
  Layers,
  LifeBuoy,
} from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  external?: boolean;
}

const NavLink = ({ href, icon: Icon, label }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = href === "/"
    ? pathname === "/" || pathname === "/protected"
    : pathname.startsWith(href);

  return (
    <div className="relative w-full flex items-center justify-center">
      <Link
        href={href}
        className={`group relative flex items-center justify-center w-full p-3 rounded-full transition-all 
          ${isActive ? "bg-blue-500 dark:bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
      >
        <Icon className={`h-5 w-5 ${isActive ? "text-white" : "group-hover:text-blue-600 dark:group-hover:text-white"}`} />
        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1 
          bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-md opacity-0 
          shadow-md transition-opacity duration-200 group-hover:opacity-100 z-50 pointer-events-none">
          {label}
        </span>
      </Link>
    </div>
  );
};

export function SideNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col items-center 
      bg-white dark:bg-[#09090b] shadow-lg dark:shadow-gray-950 ring-1 ring-gray-700/50">

      {/* Navigation Links */}
      <div className="space-y-4 mt-20">
        <NavLink href="/" icon={IndianRupee} label="Overview" />
        <NavLink href="/protected/income" icon={TrendingUp} label="Income" />
        <NavLink href="/protected/expenses" icon={RefreshCcw} label="Expenses" />
        <NavLink href="/protected/investments" icon={CreditCard} label="Investments" />
        <NavLink href="/protected/subscriptions" icon={Layers} label="Subscriptions" />
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto mb-4 space-y-2">
        <NavLink href="mailto:support@example.com" icon={LifeBuoy} label="Support" external />
        <NavLink href="/protected/settings" icon={Settings} label="Settings" />
        <NavLink href="/protected/help" icon={HelpCircle} label="Help" />
      </div>
    </aside>
  );
}