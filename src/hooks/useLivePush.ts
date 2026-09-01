"use client";

import { useEffect, useCallback } from "react";

export type LiveNotification = {
  title: string;
  body: string;
};

type Callback = (n: LiveNotification) => void;

/**
 * Subscribes to foreground Firebase push messages.
 * Only active while the app tab is in the foreground.
 */
export function useLivePush(active: boolean, onNotification: Callback) {
  const stableCb = useCallback(onNotification, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { isSupported, getMessaging, onMessage } = await import("firebase/messaging");
        const { getApps, initializeApp, getApp } = await import("firebase/app");

        const supported = await isSupported();
        if (!supported) return;

        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
        if (!apiKey || !projectId || !appId) return;

        const config = {
          apiKey,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId,
        };

        const app = getApps().length ? getApp() : initializeApp(config);
        const messaging = getMessaging(app);

        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? (payload.data as Record<string, string> | undefined)?.title ?? "Notification";
          const body = payload.notification?.body ?? (payload.data as Record<string, string> | undefined)?.body ?? "";
          stableCb({ title, body });
        });
      } catch {
        /* push optional */
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [active, stableCb]);
}
