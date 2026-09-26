"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
};

export default function OptimizedParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
    });

    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    let animationFrame = 0;
    let animationTimer = 0;
    let lastFrame = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const isMobile = width < 768;

    // Менше частинок на мобільних пристроях.
    const particleCount = isMobile ? 22 : 42;

    const particles: Particle[] = Array.from(
      { length: particleCount },
      () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.7,
        color: Math.random() > 0.5 ? "#9945FF" : "#14F195",
      })
    );

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      // Обмежуємо DPR, щоб canvas не ставав надто важким.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    };

    const update = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;

        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;
      }
    };

    const animate = (time: number) => {
      // Приблизно 30 FPS.
      if (time - lastFrame >= 33) {
        lastFrame = time;

        update();
        draw();
      }

      animationFrame = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
      draw();
    };

    resizeCanvas();

    // Фон видно одразу, але поки що він статичний.
    draw();

    window.addEventListener("resize", handleResize, {
      passive: true,
    });

    // Рух запускаємо після первинного завантаження сторінки.
    if (!reducedMotion) {
      animationTimer = window.setTimeout(() => {
        animationFrame = requestAnimationFrame(animate);
      }, 1500);
    }

    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationTimer) {
        window.clearTimeout(animationTimer);
      }

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-80"
    />
  );
}