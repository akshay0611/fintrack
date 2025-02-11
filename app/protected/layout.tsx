import { PreferencesProvider } from '@/lib/preferences-context';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      {children}
    </PreferencesProvider>
  );
}
