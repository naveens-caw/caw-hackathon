import { SignedIn, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export const TopNav = () => {
  return (
    <header className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
      <Link className="text-sm font-medium text-blue-600 underline" to="/">
        Go to Home
      </Link>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
};
