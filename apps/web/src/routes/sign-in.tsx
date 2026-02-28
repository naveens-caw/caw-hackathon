import { SignIn } from '@clerk/clerk-react';

export const SignInPage = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center p-6">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </main>
  );
};
