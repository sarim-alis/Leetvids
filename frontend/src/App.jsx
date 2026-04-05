import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";


function App() {
  return (
    <>
        <h1>Welcome to app ⭐</h1>

        <SignedOut>
         <SignInButton mode="modal" >
          <button className="">Sign up</button>
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
