import { SignUp } from '@clerk/clerk-react';
import { TopNav } from '@/components/layout/top-nav';

export const SignUpPage = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <TopNav />
      <section className="flex flex-1 items-center justify-center">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      </section>
    </main>
  );
};
