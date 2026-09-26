import { AppShell } from "@/components/app-shell";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="max-w-7xl flex flex-col gap-12 items-start">{children}</div>
    </AppShell>
  );
}
