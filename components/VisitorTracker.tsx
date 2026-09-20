"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "rcx_visitor_id";

function getVisitorId() {
  let value = window.localStorage.getItem(STORAGE_KEY);

  if (!value) {
    value = crypto.randomUUID().replaceAll("-", "");
    window.localStorage.setItem(STORAGE_KEY, value);
  }

  return value;
}

async function send(event: "pageview" | "heartbeat", visitorId: string) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, event }),
      keepalive: true,
      cache: "no-store",
    });
  } catch {
    // Analytics must never break the public website.
  }
}

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Do not count admin panel visits.
    if (pathname.startsWith("/admin")) return;

    const visitorId = getVisitorId();

    void send("pageview", visitorId);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void send("heartbeat", visitorId);
      }
    }, 30_000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void send("heartbeat", visitorId);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);

  return null;
}
