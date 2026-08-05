import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function mergeAvatarState(savedUser, nextUser) {
  if (!savedUser || !nextUser) return nextUser;
  const savedUserKey = savedUser._id || savedUser.id || savedUser.email;
  const nextUserKey = nextUser._id || nextUser.id || nextUser.email;

  if (!savedUserKey || savedUserKey !== nextUserKey) return nextUser;

  return {
    ...nextUser,
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

  const login = (authToken, authUser) => {
    let mergedUser = authUser;
    try {
      const saved = localStorage.getItem('authUser');
      if (saved) {
        mergedUser = mergeAvatarState(JSON.parse(saved), authUser);
      }
    } catch {
      mergedUser = authUser;
    }
    setToken(authToken);
    setUser(mergedUser);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const patch = typeof updates === 'function' ? updates(prev) : updates;
      return patch ? { ...prev, ...patch } : prev;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, logout, updateUser }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
