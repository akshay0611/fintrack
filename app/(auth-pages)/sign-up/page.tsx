import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Message } from "@/components/form-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return <SignUpForm message={searchParams} />;
}
