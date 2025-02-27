import { PreferencesProvider } from '@/lib/preferences-context';
import { SideNav } from '@/components/side-nav';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <div className="flex min-h-screen">
        {/* Sidebar (this is now in layout.tsx) */}
        <div className="fixed left-0 top-0 h-screen w-16">
          <SideNav />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-16 overflow-y-auto w-[calc(100%-4rem)]">
          {children}
        </div>
      </div>
    </PreferencesProvider>
  );
}