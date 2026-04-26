import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from "@clerk/clerk-react";
import { useState } from "react";

function App() {
  const { user } = useUser();
  const [testStatus, setTestStatus] = useState("");

  const testWebhook = async () => {
    setTestStatus("Testing webhook...");
    try {
      const response = await fetch("https://leetvid.onrender.com/api/test/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "user.created",
          testData: {
            id: user?.id || "test-id-" + Date.now(),
            email_addresses: [{ email_address: user?.primaryEmailAddress?.emailAddress || "test@example.com" }],
            first_name: user?.firstName || "Test",
            last_name: user?.lastName || "User"
          }
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setTestStatus("✅ Webhook test successful! Check backend logs.");
      } else {
        setTestStatus(`❌ Webhook test failed: ${result.error}`);
      }
    } catch (error) {
      setTestStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <>
        <h1>Welcome to app ⭐</h1>
        
        <SignedIn>
          <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
            <p><strong>User:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
            <p><strong>ID:</strong> {user?.id}</p>
            <button onClick={testWebhook} style={{ marginTop: "10px", padding: "5px 10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>
              🧪 Test Webhook
            </button>
            {testStatus && <p style={{ marginTop: "10px", fontSize: "14px" }}>{testStatus}</p>}
            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
              🔄 Direct webhook syncs user data to database (no Inngest)
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
