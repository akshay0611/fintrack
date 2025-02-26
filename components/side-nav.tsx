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
  Banknote,
} from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  external?: boolean;
}

const NavLink = ({ href, icon: Icon, label }: NavLinkProps) => {
  const pathname = usePathname();

 
  const isActive = href === "/" ? pathname === "/" || pathname === "/protected" : pathname.startsWith(href);

  return (
    <div className="relative w-full flex items-center justify-center">
      <Link
        href={href}
        className={`group relative flex items-center justify-center w-full p-3 rounded-lg transition-all 
          ${isActive ? "bg-gray-700 text-white" : "hover:bg-gray-800"}`}
      >
        <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`} />

       
        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-50 pointer-events-none">
          {label}
        </span>
      </Link>
    </div>
  );
};



export function SideNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col items-center bg-[#09090b] shadow-md">
      {/* App Logo - FinTrack */}
      <div className="flex items-center justify-center p-3">
        <Link href="/" className="relative flex items-center justify-center p-4 rounded-lg">
          <Banknote className="w-10 h-10 text-[#facc15]" /> {/* Yellow-Gold Color */}
        </Link>
      </div>

     
      <div className="w-10 border-t border-gray-600 my-4"></div>

      {/* Navigation Links */}
      <div className="space-y-4">
        <NavLink href="/" icon={IndianRupee} label="Overview" />
        <NavLink href="/protected/income" icon={TrendingUp} label="Income" />
        <NavLink href="/protected/expenses" icon={RefreshCcw} label="Expenses" />
        <NavLink href="/protected/investments" icon={CreditCard} label="Investments" />
        <NavLink href="/protected/subscriptions" icon={Layers} label="Subscriptions" />
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto mb-4 space-y-2">
        {/* Support Icon - Opens default mail app */}
        <NavLink href="mailto:support@example.com" icon={LifeBuoy} label="Support" external />

        {/* Settings & Help */}
        <NavLink href="/protected/settings" icon={Settings} label="Settings" />
        <NavLink href="/protected/help" icon={HelpCircle} label="Help" />
      </div>
    </aside>
  );
}
