"use client";
import { cn } from "@/utils/cn";
import { Menu as MenuIcon, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Menu, MenuItem } from "../ui/navbar-menu";

// Create an auth context
import { createContext, useContext } from "react";

const AuthContext = createContext<{
  isAuthenticated: boolean;
  signOut: () => void;
}>({
  isAuthenticated: false,
  signOut: () => {},
});

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const signOut = () => {
    setIsAuthenticated(false);
    // Add your signout logic here
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
const useAuth = () => useContext(AuthContext);

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { isAuthenticated, signOut } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname]);

  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Event" },
    { href: "/notices", label: "Notice" },
    { href: "/blogs", label: "Blog" },
    { href: "/achievements", label: "Achievement" },
  ];

  return (
    <>
      {/* Navbar */}
      <div
        className={cn(
          "fixed top-0 inset-x-0 z-50 backdrop-blur-sm border-b h-20",
          "dark:bg-gray-900/80 dark:border-gray-800",
          "light:bg-white/80 light:border-gray-200",
          className
        )}
      >
        <div className="max-w-2xl mx-auto px-4 h-full flex items-center">
          {/* Desktop Menu */}
          <div className="hidden md:block w-full">
            <Menu setActive={setActive}>
              {menuItems.map((item) => (
                <Link href={item.href} key={item.label}>
                  <MenuItem
                    setActive={setActive}
                    active={active}
                    item={item.label}
                  />
                </Link>
              ))}

              {!isAuthenticated ? (
                <Link href="/signin">
                  <MenuItem
                    setActive={setActive}
                    active={active}
                    item="Login"
                  />
                </Link>
              ) : (
                <button onClick={signOut}>
                  <MenuItem
                    setActive={setActive}
                    active={active}
                    item="Logout"
                  />
                </button>
              )}
            </Menu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "p-2 rounded-md",
                "dark:text-gray-300 dark:hover:bg-gray-800",
                "light:text-gray-700 light:hover:bg-gray-100"
              )}
            >
              {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className={cn(
            "fixed top-16 inset-x-0 z-40 border-b md:hidden",
            "dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300",
            "light:bg-white light:border-gray-200 light:text-gray-700"
          )}
        >
          <div className="flex flex-col space-y-4 px-4 py-6">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "py-2 transition-colors duration-200",
                  "dark:text-gray-300 dark:hover:text-white",
                  "light:text-gray-700 light:hover:text-gray-900"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {!isAuthenticated ? (
              <Link
                href="/signin"
                className={cn(
                  "py-2 transition-colors duration-200",
                  "dark:text-gray-300 dark:hover:text-white",
                  "light:text-gray-700 light:hover:text-gray-900"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            ) : (
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "py-2 text-left transition-colors duration-200",
                  "dark:text-gray-300 dark:hover:text-white",
                  "light:text-gray-700 light:hover:text-gray-900"
                )}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Spacer to prevent content from going under navbar */}
      <div className="h-20" />
    </>
  );
}

export default Navbar;
