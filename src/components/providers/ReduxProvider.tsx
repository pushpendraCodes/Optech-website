"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { hydrate } from "@/lib/studentAuthSlice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    store.dispatch(hydrate());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
