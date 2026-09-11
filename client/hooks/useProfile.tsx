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

const STORAGE_KEYS = {
  PROFILE: "user_profile",
  ROLE_ACCESS: "role_access",
};

const getSessionStorageItem = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Error reading ${key} from sessionStorage:`, e);
    return null;
  }
};

const setSessionStorageItem = <T,>(key: string, value: T | null) => {
  if (typeof window === "undefined") return;
  try {
    if (value === null || value === undefined) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error(`Error writing ${key} to sessionStorage:`, e);
  }
};

const removeSessionStorageItem = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing ${key} from sessionStorage:`, e);
  }
};

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
  const [profile, setProfileState] = useState<UserProfile | null>(() =>
    getSessionStorageItem<UserProfile>(STORAGE_KEYS.PROFILE)
  );
  const [roleAccess, setRoleAccessState] = useState<RoleAccessType | null>(() =>
    getSessionStorageItem<RoleAccessType>(STORAGE_KEYS.ROLE_ACCESS)
  );
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEYS.PROFILE)) {
      return false;
    }
    return true;
  });
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const setProfile = useCallback(
    (value: UserProfile | null | ((prev: UserProfile | null) => UserProfile | null)) => {
      setProfileState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        setSessionStorageItem(STORAGE_KEYS.PROFILE, next);
        return next;
      });
    },
    []
  );

  const setRoleAccess = useCallback(
    (value: RoleAccessType | null | ((prev: RoleAccessType | null) => RoleAccessType | null)) => {
      setRoleAccessState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        setSessionStorageItem(STORAGE_KEYS.ROLE_ACCESS, next);
        return next;
      });
    },
    []
  );

  const fetchProfileAndRole = useCallback(async () => {
    const token = getJWT();
    const userId = getUserID();

    if (!token || !userId) {
      setProfile(null);
      setRoleAccess(null);
      removeSessionStorageItem(STORAGE_KEYS.PROFILE);
      removeSessionStorageItem(STORAGE_KEYS.ROLE_ACCESS);
      setLoading(false);
      return;
    }

    try {
      if (!getSessionStorageItem(STORAGE_KEYS.PROFILE)) {
        setLoading(true);
      }
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
  }, [setProfile, setRoleAccess]);

  useEffect(() => {
    const token = getJWT();
    if (token) {
      fetchProfileAndRole();
    } else {
      setProfile(null);
      setRoleAccess(null);
      removeSessionStorageItem(STORAGE_KEYS.PROFILE);
      removeSessionStorageItem(STORAGE_KEYS.ROLE_ACCESS);
      setLoading(false);
    }
  }, [pathname, fetchProfileAndRole, setProfile, setRoleAccess]);

  const login = useCallback(
    (userData: UserProfile, token?: string, roleData?: RoleAccessType) => {
      setProfile(userData);
      setLoading(false);
      if (roleData) {
        setRoleAccess(roleData);
      }
      fetchProfileAndRole();
    },
    [fetchProfileAndRole, setProfile, setRoleAccess]
  );

  const logout = useCallback(() => {
    clearCookies();
    setProfile(null);
    setRoleAccess(null);
    removeSessionStorageItem(STORAGE_KEYS.PROFILE);
    removeSessionStorageItem(STORAGE_KEYS.ROLE_ACCESS);
  }, [setProfile, setRoleAccess]);

  const updateProfileLocal = useCallback(
    (updated: Partial<UserProfile>) => {
      setProfile((prev) => (prev ? { ...prev, ...updated } : null));
    },
    [setProfile]
  );

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

