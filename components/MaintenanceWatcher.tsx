"use client";

import { useEffect } from "react";

export default function MaintenanceWatcher() {
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/maintenance-status", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.ok && data.maintenance === false) {
          window.location.replace("/");
        }
      } catch {
        // Якщо сервер/БД тимчасово недоступні — просто залишаємо
        // користувача на maintenance-сторінці.
      }
    };

    checkStatus();

    const interval = window.setInterval(checkStatus, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
