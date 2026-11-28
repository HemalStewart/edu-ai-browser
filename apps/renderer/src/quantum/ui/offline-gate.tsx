"use client";

import { createContext, useContext, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Icon } from "./icons";

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}
const getSnapshot = () => (typeof navigator === "undefined" ? true : navigator.onLine !== false);
const getServerSnapshot = () => true;

/** `true` while the browser reports a network connection. */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Quantum tools need the cloud. While `navigator.onLine` is false this covers the screen with a
 * clear offline message. Children stay mounted (made inert) so nothing is lost on reconnect.
 */
const GateContext = createContext(false);

export function OfflineGate({ children }: { children: ReactNode }) {
  // QuantumShell already includes a gate; a gate nested inside another one renders only its children.
  const nested = useContext(GateContext);
  const online = useOnline();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (nested) return;
    const el = wrapRef.current as (HTMLDivElement & { inert?: boolean }) | null;
    if (el) el.inert = !online;
  }, [online, nested]);

  if (nested) return <>{children}</>;

  return (
    <GateContext.Provider value={true}>
      <div ref={wrapRef} style={{ display: "contents" }} aria-hidden={online ? undefined : true}>
        {children}
      </div>
      {online ? null : (
        <div className="q-offline" role="alertdialog" aria-modal="true" aria-labelledby="q-offline-title" aria-describedby="q-offline-text">
          <div className="q-card q-offline__card">
            <div className="q-empty">
              <span className="q-empty__icon" aria-hidden>
                <Icon name="wifi-off" size={18} />
              </span>
              <p className="q-empty__title" id="q-offline-title">
                You&rsquo;re offline
              </p>
              <p className="q-empty__text" id="q-offline-text">
                Quantum needs an internet connection. Your work is kept on this screen and the app will continue as soon as
                you reconnect.
              </p>
              <span className="q-badge" style={{ marginTop: 12 }}>
                <span aria-hidden className="q-badge__dot q-badge__dot--pulse" />
                Waiting for network
              </span>
            </div>
          </div>
        </div>
      )}
    </GateContext.Provider>
  );
}
