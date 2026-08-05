import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '../firebase';
import { DEFAULT_APP_SETTINGS, THEME_PRESETS } from '../constants/appSettings';

const SETTINGS_DOC = doc(firebaseDb, 'settings', 'app');

function normalizeTheme(theme = {}) {
  const preset = THEME_PRESETS[theme?.key] || THEME_PRESETS.darkCasino;

  return {
    ...preset,
    ...(theme || {}),
  };
}

function normalizeGameCatalog(rawGames = []) {
  const list = Array.isArray(rawGames)
    ? rawGames
      .filter((game) => game && typeof game === 'object')
      .map((game, index) => ({
        id: String(game.id || `game-${index + 1}`),
        title: String(game.title || `Game ${index + 1}`),
        gameType: game.gameType === '3d-webgl' ? '3d-webgl' : '2d',
        thumbnailUrl: String(game.thumbnailUrl || ''),
        sourceUrl: String(game.sourceUrl || ''),
        renderMode: game.renderMode === 'webgl-path' ? 'webgl-path' : 'iframe',
        isActive: Boolean(game.isActive),
      }))
    : [];

  if (!list.length) {
    return DEFAULT_APP_SETTINGS.gameCatalog;
  }

  let hasActive = false;
  const activeNormalized = list.map((game, index) => {
    if (game.isActive && !hasActive) {
      hasActive = true;
      return game;
    }

    return {
      ...game,
      isActive: false,
    };
  });

  if (!hasActive) {
    activeNormalized[0] = {
      ...activeNormalized[0],
      isActive: true,
    };
  }

  return activeNormalized;
}

function normalizeSettings(raw = {}) {
  return {
    ...DEFAULT_APP_SETTINGS,
    ...(raw || {}),
    appTheme: normalizeTheme(raw?.appTheme || DEFAULT_APP_SETTINGS.appTheme),
    easypaisaDetails: {
      ...DEFAULT_APP_SETTINGS.easypaisaDetails,
      ...(raw?.easypaisaDetails || {}),
    },
    jazzcashDetails: {
      ...DEFAULT_APP_SETTINGS.jazzcashDetails,
      ...(raw?.jazzcashDetails || {}),
    },
    bankDetails: {
      ...DEFAULT_APP_SETTINGS.bankDetails,
      ...(raw?.bankDetails || {}),
    },
    bannerImages: Array.isArray(raw?.bannerImages) ? raw.bannerImages.filter(Boolean) : DEFAULT_APP_SETTINGS.bannerImages,
    gameCatalog: normalizeGameCatalog(raw?.gameCatalog),
    adminAuthorizedEmails: Array.isArray(raw?.adminAuthorizedEmails) ? raw.adminAuthorizedEmails : [],
    adminAuthorizedPhones: Array.isArray(raw?.adminAuthorizedPhones) ? raw.adminAuthorizedPhones : [],
  };
}

export function useAppSettings() {
  const [settings, setSettings] = useState(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      SETTINGS_DOC,
      async (snapshot) => {
        if (!snapshot.exists()) {
          await setDoc(SETTINGS_DOC, {
            ...DEFAULT_APP_SETTINGS,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          setSettings(DEFAULT_APP_SETTINGS);
          setLoading(false);
          return;
        }

        setSettings(normalizeSettings(snapshot.data()));
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        setError(snapshotError.message || 'Unable to load app settings from Firestore.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const saveSettings = async (patch = {}, actor = '') => {
    const normalizedPatch = {
      ...patch,
      updatedAt: serverTimestamp(),
      updatedBy: actor || 'admin-panel',
    };

    await setDoc(SETTINGS_DOC, normalizedPatch, { merge: true });
  };

  const value = useMemo(() => ({
    settings,
    loading,
    error,
    saveSettings,
    normalizeSettings,
  }), [settings, loading, error]);

  return value;
}
