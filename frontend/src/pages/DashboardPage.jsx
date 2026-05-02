import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";

function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to LeetVid</h1>
          <p className="text-base-content/70">Sign in to start coding together</p>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <SignIn 
              path="/dashboard"
              routing="path"
              signUpUrl="/dashboard/sign-up"
              redirectUrl="/"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;