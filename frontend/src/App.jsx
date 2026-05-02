import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";


function App() {
  return (
    <>
        <h1 className="text-orange-300 font-bold">Welcome to app ⭐</h1>
        <button className="btn btn-primary">Daisuy ui</button>

        <SignedOut>
         <SignInButton mode="modal">
          <button>Login</button>
         </SignInButton>
        </SignedOut>

        <SignedIn>
          <SignOutButton />
        </SignedIn>
        <UserButton />
    </>
  );
}

export default App
