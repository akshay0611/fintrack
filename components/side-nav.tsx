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
import { useEffect } from "react";

// Define a type for the keys
type KeyMapKeys = "o" | "i" | "e" | "v" | "s";

// Define the keyMap with a type-safe mapping and add shortcut labels
const keyMap: Record<KeyMapKeys, { href: string; shortcut: string }> = {
  o: { href: "/", shortcut: "o" },
  i: { href: "/protected/income", shortcut: "i" },
  e: { href: "/protected/expenses", shortcut: "e" },
  v: { href: "/protected/investments", shortcut: "v" },
  s: { href: "/protected/subscriptions", shortcut: "s" },
};

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  external?: boolean;
  shortcut?: string; // Optional shortcut prop
}

const NavLink = ({ href, icon: Icon, label, shortcut }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = href === "/"
    ? pathname === "/" || pathname === "/protected"
    : pathname.startsWith(href);

  return (
    <div className="relative w-full flex items-center justify-center">
      <Link
        href={href}
        className={`group relative flex items-center justify-center w-full p-3 rounded-full transition-all
          ${
            isActive
              ? "bg-blue-500 dark:bg-blue-600 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
      >
        <Icon className={`h-5 w-5 ${
          isActive
            ? "text-white"
            : "group-hover:text-blue-600 dark:group-hover:text-white"
        }`} />

        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1 
          bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-md opacity-0 
          shadow-md transition-opacity duration-200 group-hover:opacity-100 z-50 pointer-events-none">
          {label} {shortcut && `(Press ${shortcut.toUpperCase()})`}
        </span>
      </Link>
    </div>
  );
}; 

export function SideNav() {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase() as KeyMapKeys;
      if (keyMap.hasOwnProperty(key)) {
        event.preventDefault(); // Prevent default behavior (e.g., scrolling)
        window.location.href = keyMap[key].href; // Navigate to the corresponding route
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []); // Empty dependency array means it runs once on mount

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col items-center 
      bg-white dark:bg-[#09090b] shadow-lg dark:shadow-gray-950 ring-1 ring-gray-700/50">
      
      {/* Navigation Links */}
      <div className="space-y-4 mt-20">
        <NavLink href={keyMap.o.href} icon={IndianRupee} label="Overview" shortcut={keyMap.o.shortcut} />
        <NavLink href={keyMap.i.href} icon={TrendingUp} label="Income" shortcut={keyMap.i.shortcut} />
        <NavLink href={keyMap.e.href} icon={RefreshCcw} label="Expenses" shortcut={keyMap.e.shortcut} />
        <NavLink href={keyMap.v.href} icon={CreditCard} label="Investments" shortcut={keyMap.v.shortcut} />
        <NavLink href={keyMap.s.href} icon={Layers} label="Subscriptions" shortcut={keyMap.s.shortcut} />
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