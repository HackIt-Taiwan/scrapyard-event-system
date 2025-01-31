"use client";

// We NEED this cuz we need to have `toast`
// UX matters, do NOT remove this file unless you have a better way to deal with errors.

import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex grow place-items-center justify-center">
      <div className="flex h-full place-items-center justify-center">
        {children}
      </div>
    </div>
  );
}
