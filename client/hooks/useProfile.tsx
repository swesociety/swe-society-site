"use client";

import { clearCookies } from "@/data/cookies/deleteCookies";
import { getJWT, getUserID } from "@/data/cookies/getCookies";
import { RoleAccessType, UserProfile } from "@/data/types";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import axios from "axios";
import { usePathname } from "next/navigation";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface ProfileContextType {
  profile: UserProfile | null;
  roleAccess: RoleAccessType | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasStandingsAccess: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileLocal: (updated: Partial<UserProfile>) => void;
  login: (user: UserProfile, token?: string, roleData?: RoleAccessType) => void;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  roleAccess: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  hasStandingsAccess: false,
  refreshProfile: async () => {},
  updateProfileLocal: () => {},
  login: () => {},
  logout: () => {},
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roleAccess, setRoleAccess] = useState<RoleAccessType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const fetchProfileAndRole = useCallback(async () => {
    const token = getJWT();
    const userId = getUserID();

    if (!token || !userId) {
      setProfile(null);
      setRoleAccess(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch profile and role access in parallel
      const [profileRes, roleRes] = await Promise.allSettled([
        axios.get(`${APIENDPOINTS.users.getUserbyID}/${userId}`, headerConfig()),
        axios.get(APIENDPOINTS.users.getRoleAccess, headerConfig()),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.status === 200) {
        setProfile(profileRes.value.data);
      } else {
        console.warn("Failed to fetch user profile data");
      }

      if (roleRes.status === "fulfilled" && roleRes.value.status === 200) {
        setRoleAccess(roleRes.value.data);
      } else {
        console.warn("Failed to fetch role access data");
      }
    } catch (err: any) {
      console.error("Error in useProfile:", err);
      setError(err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch on initial mount or when navigating to a new route if profile is missing
  useEffect(() => {
    const token = getJWT();
    if (token && (!profile || !roleAccess)) {
      fetchProfileAndRole();
    } else if (!token) {
      setLoading(false);
    }
  }, [pathname, fetchProfileAndRole, profile, roleAccess]);

  // Called synchronously upon login to immediately hydrate memory state
  const login = useCallback(
    (userData: UserProfile, token?: string, roleData?: RoleAccessType) => {
      setProfile(userData);
      setLoading(false);
      if (roleData) {
        setRoleAccess(roleData);
      }
      // Trigger background sync for full profile details and role access
      fetchProfileAndRole();
    },
    [fetchProfileAndRole]
  );

  const logout = useCallback(() => {
    clearCookies();
    setProfile(null);
    setRoleAccess(null);
  }, []);

  const updateProfileLocal = useCallback((updated: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : null));
  }, []);

  const hasStandingsAccess = useMemo(() => {
    if (!profile && !roleAccess) return false;
    return Boolean(
      roleAccess?.standings ||
        profile?.role === "Super Admin" ||
        (profile as any)?.roleid === 1
    );
  }, [roleAccess, profile]);

  const value = useMemo(
    () => ({
      profile,
      roleAccess,
      loading,
      error,
      isAuthenticated: Boolean(getJWT() || profile),
      hasStandingsAccess,
      refreshProfile: fetchProfileAndRole,
      updateProfileLocal,
      login,
      logout,
    }),
    [
      profile,
      roleAccess,
      loading,
      error,
      hasStandingsAccess,
      fetchProfileAndRole,
      updateProfileLocal,
      login,
      logout,
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export default useProfile;
