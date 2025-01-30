"use client";

// We NEED this cuz we need to have `toast`
// UX matters, do NOT remove this file unless you have a better way to deal with errors.

import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster />
      {children}
    </>
  );
}
