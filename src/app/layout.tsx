import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { GoogleTranslate } from "@/components/common/GoogleTranslate";

export const metadata: Metadata = {
  title: "Aegis AI — Enterprise AI Customer Support Agent",
  description: "World-Class Autonomous Machine Learning Customer Operations SaaS Platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="antialiased selection:bg-indigo-500 selection:text-white" suppressHydrationWarning>
        <UserProvider>
          {children}
          <EditProfileModal />
          <GoogleTranslate variant="floating" />
        </UserProvider>
      </body>
    </html>
  );
}
