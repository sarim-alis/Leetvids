import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProblemsPage from "./pages/ProblemsPage";
import DashboardPage from "./pages/DashboardPage";
import { Toaster } from "react-hot-toast";

function App() {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        <Route path="/"          element={isSignedIn ? <HomePage />      : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={!isSignedIn ?  <DashboardPage /> : <Navigate to={"/"} />} />
        <Route path="/about"     element={<AboutPage />} />
        <Route path="/problems"  element={isSignedIn ?  <ProblemsPage />  : <HomePage />} />
      </Routes>

      <Toaster position="top-right" toastOptions={{duration:3000}} />
    </>
  );
}

export default App;
