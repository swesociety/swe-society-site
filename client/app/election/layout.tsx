import CheckAuthentication from "@/components/auth/CheckAuthentication";
import React from "react";

export default function ElectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckAuthentication>{children}</CheckAuthentication>;
}
