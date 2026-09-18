import { SignIn } from "@clerk/nextjs";

export const SignInPage = () => (
  <main className="flex justify-center px-4 py-16">
    <SignIn />
  </main>
);
