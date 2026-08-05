import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth } from '../firebase';
import {
  ADMIN_SESSION_STORAGE_KEY,
  isAdminSessionValid,
  matchesSuperAdminIdentity,
  normalizeEmail,
  normalizePhone,
} from '../security/adminSecurity';

const AuthContext = createContext(null);

function normalizeAuthUser(authUser) {
  if (!authUser) return authUser;
  const id = authUser._id || authUser.id;

  return {
    ...authUser,
    _id: id || authUser._id,
    id: id || authUser.id,
  };
}

function mergeAvatarState(savedUser, nextUser) {
  if (!savedUser || !nextUser) return normalizeAuthUser(nextUser);
  const normalizedNextUser = normalizeAuthUser(nextUser);
  const savedUserKey = savedUser._id || savedUser.id || savedUser.email;
  const nextUserKey = normalizedNextUser._id || normalizedNextUser.id || normalizedNextUser.email;

  if (!savedUserKey || savedUserKey !== nextUserKey) return normalizedNextUser;

  return {
    ...normalizedNextUser,
    avatarKey: savedUser.avatarKey ?? nextUser.avatarKey,
    avatarLabel: savedUser.avatarLabel ?? nextUser.avatarLabel,
    avatarEmoji: savedUser.avatarEmoji ?? nextUser.avatarEmoji,
    avatarImage: savedUser.avatarImage ?? nextUser.avatarImage,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('authUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const [phoneVerification, setPhoneVerificationState] = useState(() => {
    const saved = localStorage.getItem('phoneVerification');
    return saved ? JSON.parse(saved) : null;
  });
  const [firebaseUser, setFirebaseUser] = useState(() => {
    const current = firebaseAuth.currentUser;
    return current ? {
      uid: current.uid,
      phoneNumber: current.phoneNumber || '',
      email: current.email || '',
    } : null;
  });
  const [adminSession, setAdminSessionState] = useState(() => {
    const saved = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setFirebaseUser(nextUser ? {
        uid: nextUser.uid,
        phoneNumber: nextUser.phoneNumber || '',
        email: nextUser.email || '',
      } : null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [user]);

  useEffect(() => {
    if (phoneVerification) {
      localStorage.setItem('phoneVerification', JSON.stringify(phoneVerification));
    } else {
      localStorage.removeItem('phoneVerification');
    }
  }, [phoneVerification]);

  useEffect(() => {
    if (adminSession) {
      localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(adminSession));
    } else {
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    }
  }, [adminSession]);

  useEffect(() => {
    if (!adminSession) return;

    const valid = isAdminSessionValid(adminSession, {
      phone: user?.phone || firebaseUser?.phoneNumber || '',
      email: user?.email || firebaseUser?.email || '',
    });

    if (!valid) {
      setAdminSessionState(null);
    }
  }, [adminSession, firebaseUser, user]);

  const login = (authToken, authUser) => {
    let mergedUser = normalizeAuthUser(authUser);
    try {
      const saved = localStorage.getItem('authUser');
      if (saved) {
        mergedUser = mergeAvatarState(JSON.parse(saved), authUser);
      }
    } catch {
      mergedUser = normalizeAuthUser(authUser);
    }
    setToken(authToken);
    setUser(mergedUser);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const patch = typeof updates === 'function' ? updates(prev) : updates;
      return patch ? normalizeAuthUser({ ...prev, ...patch }) : prev;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPhoneVerificationState(null);
    setAdminSessionState(null);
    signOut(firebaseAuth).catch(() => {});
  };

  const setPhoneVerification = (verification) => {
    setPhoneVerificationState(verification || null);
  };

  const setAdminSession = (session) => {
    setAdminSessionState(session || null);
  };

  const clearAdminSession = () => {
    setAdminSessionState(null);
  };

  const isSuperAdmin = useMemo(() => {
    const effectivePhone = normalizePhone(user?.phone || firebaseUser?.phoneNumber || '');
    const effectiveEmail = normalizeEmail(user?.email || firebaseUser?.email || '');
    const hasIdentity = matchesSuperAdminIdentity({ phone: effectivePhone, email: effectiveEmail });

    if (!hasIdentity || !adminSession) return false;

    return isAdminSessionValid(adminSession, {
      phone: effectivePhone,
      email: effectiveEmail,
    });
  }, [adminSession, firebaseUser, user?.email, user?.phone]);

  const value = useMemo(
    () => ({
      user,
      token,
      phoneVerification,
      firebaseUser,
      adminSession,
      isSuperAdmin,
      login,
      logout,
      updateUser,
      setPhoneVerification,
      setAdminSession,
      clearAdminSession,
    }),
    [user, token, phoneVerification, firebaseUser, adminSession, isSuperAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
