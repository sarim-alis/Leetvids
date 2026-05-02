// Imports.
import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, MoonIcon, SparklesIcon, SunIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

// Frontend.
function Navbar() {
  // States.
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toggle Theme.
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200">
          <div className="size-10 rounded-xl bg-linear-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
            <SparklesIcon className="size-6 text-white" />
          </div>

          <div className="flex flex-col">
            <span className="font-black text-xl bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-white font-mono tracking-wider">
              LeetVid
            </span>
            <span className="text-xs text-base-content/60 font-medium -mt-1">Code Together</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Problem Link */}
          <Link to={"/problems"} className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive("/problems") ? "bg-primary text-primary-content" : "hover:bg-base-200 text-base-content/70 hover:text-base-content"}`}>
            <div className="flex items-center gap-x-2.5">
              <BookOpenIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Problems</span>
            </div>
          </Link>

          {/* Dashboard Link */}
          <Link to={"/dashboard"} className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive("/dashboard") ? "bg-primary text-primary-content" : "hover:bg-base-200 text-base-content/70 hover:text-base-content border border-white"}`}>
            <div className="flex items-center gap-x-2.5">
              <LayoutDashboardIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Dashboard</span>
            </div>
          </Link>

          {/* Theme Toggle Button - Centered */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-base-200 hover:bg-base-300 transition-colors duration-200 border border-base-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="size-5 text-warning" />
              ) : (
                <MoonIcon className="size-5 text-base-content" />
              )}
            </button>
          </div>

          <div className="ml-4 mt-2">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;