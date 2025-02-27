import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { User } from "lucide-react";

export default async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <Badge variant="outline" className="font-normal bg-red-50/50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800">
          <span className="mr-2">⚠️</span>
          Update .env.local with Supabase credentials
        </Badge>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="opacity-75 cursor-not-allowed">
            <Link href="/sign-in" className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sign in
              </span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="opacity-75 cursor-not-allowed">
            <Link href="/sign-up" className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Sign up
              </span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {user.email}
        </span>
      </div>
      <form action={signOutAction}>
        <Button 
          type="submit" 
          variant="outline" 
          className="hover:bg-red-50/50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 transition-colors border-red-200 dark:border-red-800"
        >
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
        <Link href="/sign-in">
          Sign in
        </Link>
      </Button>
    </div>
  );
}
