import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from "@clerk/clerk-react";

function App() {
  const { user } = useUser();

  return (
    <>
        <h1>Welcome to app ⭐</h1>
        
        <SignedIn>
          <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
            <p><strong>User:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
            <p><strong>ID:</strong> {user?.id}</p>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
              🔄 Webhook automatically syncs user data to database
            </p>
          </div>
          <SignOutButton />
        </SignedIn>

        <SignedOut>
         <SignInButton mode="modal" >
          <button>Sign up</button>
         </SignInButton>
        </SignedOut>

        <UserButton />
    </>
  );
}

export default App
