import { AuthProvider } from "@/components/global/Navbar";
import NavbarWrapper from "@/components/global/Navwrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SWE Society",
  description:
    "Official website of SWE Society, Shahjalal University of Science and Technology (SUST)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NavbarWrapper />
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster />

      </body>
    </html>
  );
}

