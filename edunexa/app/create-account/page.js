import CreateAccountForm from "./CreateAccountForm";
import { isEmailDeliveryConfigured } from "@/lib/email";

const signupRoles = new Set(["STUDENT", "TEACHER", "PARENT"]);

export default async function CreateAccountPage({ searchParams }) {
  const params = await searchParams;
  const requestedRole = typeof params?.role === "string" ? params.role.toUpperCase() : "STUDENT";
  const initialRole = signupRoles.has(requestedRole) ? requestedRole : "STUDENT";
  const googleAccountExists = params?.googleSignup === "existing";

  return <CreateAccountForm initialRole={initialRole} googleAccountExists={googleAccountExists} emailVerificationAvailable={isEmailDeliveryConfigured()} />;
}
