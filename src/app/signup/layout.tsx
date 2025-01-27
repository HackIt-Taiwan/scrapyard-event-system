"use client";
import dynamic from "next/dynamic";

const MultistepFormContextProvider = dynamic(() => import("./context"), {
  ssr: false,
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MultistepFormContextProvider>{children}</MultistepFormContextProvider>
  );
}
