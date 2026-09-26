export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white px-5 py-12 text-ink">
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
