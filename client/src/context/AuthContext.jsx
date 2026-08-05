import { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
  };

  const setPhoneVerification = (verification) => {
    setPhoneVerificationState(verification || null);
  };

  const value = useMemo(
    () => ({ user, token, phoneVerification, login, logout, updateUser, setPhoneVerification }),
    [user, token, phoneVerification],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
