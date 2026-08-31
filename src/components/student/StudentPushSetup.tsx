"use client";

import { useEffect, useRef } from "react";
import { useSavePushTokenMutation } from "@/lib/api";
import { registerWebPushToken } from "@/lib/firebase-push";

export function StudentPushSetup({ active }: { active: boolean }) {
  const [saveToken] = useSavePushTokenMutation();
  const saved = useRef(false);

  useEffect(() => {
    if (!active || saved.current) return;
    saved.current = true;

    void (async () => {
      try {
        const token = await registerWebPushToken();
        if (token) await saveToken({ token }).unwrap();
      } catch {
        /* push optional — browser may block or Firebase not configured */
      }
    })();
  }, [active, saveToken]);

  return null;
}
