import { SignUp } from '@clerk/clerk-react';

export const SignUpPage = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center p-6">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </main>
  );
};
