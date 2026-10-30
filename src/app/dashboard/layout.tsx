import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardBackground } from "@/components/layout/DashboardBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen selection:bg-indigo-500 selection:text-white">
      <DashboardBackground />
      <Sidebar />
      <div className="lg:pl-80 p-4 lg:p-6 lg:pt-4 transition-all duration-300 relative z-10">
        <main>{children}</main>
      </div>
    </div>
  );
}
