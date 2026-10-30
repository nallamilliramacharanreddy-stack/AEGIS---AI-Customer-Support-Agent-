"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatar: string;
  department: string;
  phone: string;
  bio: string;
  timezone: string;
  status: "Online" | "Away" | "Busy" | "Offline";
}

export const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
];

export const DEFAULT_PROFILE: UserProfile = {
  name: "Elena Rostova",
  role: "Head of Customer Support",
  email: "elena.rostova@aegis-ai.io",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
  department: "Customer Operations & AI Ops",
  phone: "+1 (555) 349-2810",
  bio: "Spearheading autonomous customer tier-1 triage and automated AI workflows at Aegis.",
  timezone: "Pacific Time (PT) - UTC-8",
  status: "Online",
};

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  resetProfile: () => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  openEditModal: () => void;
  closeEditModal: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "aegis_user_profile_v1";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error reading user profile from localStorage:", e);
    }
    setMounted(true);

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setProfile(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Error parsing profile from storage event:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("aegis:user-profile-updated", { detail: next }));
        }
      } catch (e) {
        console.error("Error saving user profile to localStorage:", e);
      }
      return next;
    });
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("aegis:user-profile-updated", { detail: DEFAULT_PROFILE }));
      }
    } catch (e) {
      console.error("Error resetting profile in localStorage:", e);
    }
  };

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  const logout = () => {
    // Clear any active session data
    try {
      localStorage.removeItem("aegis_auth_token");
      localStorage.removeItem("aegis_session");
    } catch (e) {
      // ignore
    }
    // Navigate straight to the Home page
    router.push("/");
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        updateProfile,
        resetProfile,
        isEditModalOpen,
        setIsEditModalOpen,
        openEditModal,
        closeEditModal,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
