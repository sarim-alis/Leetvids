import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from "@clerk/clerk-react";
import { useState } from "react";

function App() {
  const { user } = useUser();
  const [webhookStatus, setWebhookStatus] = useState("");

  const testWebhook = async () => {
    setWebhookStatus("Testing webhook...");
    try {
      const response = await fetch("https://leetvid.onrender.com/api/clerk/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "user.created",
          data: {
            id: user?.id || "test-id",
            email_addresses: [{ email_address: user?.primaryEmailAddress?.emailAddress || "test@example.com" }],
            first_name: user?.firstName || "Test",
            last_name: user?.lastName || "User"
          }
        })
      });
      
      if (response.ok) {
        setWebhookStatus("✅ Webhook test successful!");
      } else {
        setWebhookStatus("❌ Webhook test failed");
      }
    } catch (error) {
      setWebhookStatus(`❌ Error: ${error.message}`);
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
            <button onClick={testWebhook} style={{ marginTop: "10px", padding: "5px 10px" }}>
              Test Webhook
            </button>
            {webhookStatus && <p style={{ marginTop: "10px" }}>{webhookStatus}</p>}
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
