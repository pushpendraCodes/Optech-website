import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

export type FirebaseWebConfig = FirebaseOptions & { vapidKey?: string };

function readConfig(): FirebaseWebConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !projectId || !appId) return null;
  return {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId,
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  };
}

async function serviceWorkerRegistration(config: FirebaseOptions) {
  if (!("serviceWorker" in navigator)) return undefined;
  const existing = await navigator.serviceWorker.getRegistration("/firebase-cloud-messaging-push-scope");
  if (existing) return existing;

  const serialized = JSON.stringify(config);
  const script = `
    importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
    firebase.initializeApp(${serialized});
  `;
  const blob = new Blob([script], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  try {
    const registration = await navigator.serviceWorker.register(url, { scope: "/firebase-cloud-messaging-push-scope" });
    await navigator.serviceWorker.ready;
    return registration;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function registerWebPushToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const config = readConfig();
  if (!config?.vapidKey) return null;
  if (!(await isSupported())) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const { vapidKey, ...firebaseConfig } = config;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  const registration = await serviceWorkerRegistration(firebaseConfig);
  if (!registration) return null;

  return getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
}
