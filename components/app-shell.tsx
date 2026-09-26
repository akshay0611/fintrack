import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

/**
 * Chrome shared by every non-marketing route (the authenticated application
 * and the auth pages). It is intentionally kept out of the root layout so the
 * public landing page can own the full viewport width with its own navbar.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-start border-b border-b-foreground/10 h-16 px-5 sticky top-0 bg-background z-50">
          <div className="w-full max-w-5xl flex items-center p-3 px-5 text-sm">
            <Link href="/" className="flex items-center gap-2 logo-shift">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinTrack
              </span>
            </Link>
            <div className="absolute top-0 right-0 flex items-center gap-4 p-4">
              <HeaderAuth />
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
        <div className="flex flex-col gap-20 max-w-5xl p-5">{children}</div>
        <footer className="w-full border-t border-foreground/10 mt-24">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} FinTrack. All rights reserved.
              </p>
              <p className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Built with ❤️ by Akshay
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
