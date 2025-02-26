import { Overview } from '@/components/overview'; // Import the FinancialOverview component
import { SideNav } from '@/components/side-nav'; // Import the SideNav component
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-16">
        <SideNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-16 overflow-y-auto w-[calc(100%-4rem)]">
        <Overview />
      </div>
    </div>
  );
}