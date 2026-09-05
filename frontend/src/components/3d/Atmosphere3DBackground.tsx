import React, { useEffect, useRef, useState } from 'react';
import { IoTBlueprintWatermark } from './IoTBlueprintWatermark';

export type AtmosphereVariant = 'hero' | 'showcase' | 'auth' | 'dashboard' | 'device-config';

interface Atmosphere3DBackgroundProps {
  variant?: AtmosphereVariant;
  interactive?: boolean;
  className?: string;
  configState?: 'idle' | 'changed' | 'saved';
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
}

export const Atmosphere3DBackground: React.FC<Atmosphere3DBackgroundProps> = ({
  variant = 'hero',
  interactive = true,
  className = '',
  configState = 'idle',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check prefers-reduced-motion (Section 36.16)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Mouse Parallax listener (Section 36.5) - gentle dampening
  useEffect(() => {
    if (!interactive || isReducedMotion || variant === 'dashboard') return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normal range: max ±12px offset
      targetX = ((e.clientX / innerWidth) - 0.5) * 24;
      targetY = ((e.clientY / innerHeight) - 0.5) * 24;
    };

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setMouseOffset({ x: currentX, y: currentY });
      rafId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [interactive, isReducedMotion, variant]);

  // Micro 3D Particle Canvas (Section 36.13: 20-30 on desktop, 8-12 on mobile)
  useEffect(() => {
    // Only render particles for hero, showcase, and device-config (Section 36.11 disables on dashboard)
    if (variant === 'dashboard' || isReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const particleCount = variant === 'auth' ? 10 : isMobile ? 12 : 28;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle3D[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: Math.random() * 600 + 150,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        vz: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.2 + 0.8,
        alpha: Math.random() * 0.15 + 0.05,
      });
    }

    const fov = 400;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z < 100) p.z = 750;
        if (p.z > 750) p.z = 100;
        if (p.x < -width * 0.6) p.x = width * 0.6;
        if (p.x > width * 0.6) p.x = -width * 0.6;
        if (p.y < -height * 0.6) p.y = height * 0.6;
        if (p.y > height * 0.6) p.y = -height * 0.6;

        const scale = fov / (fov + p.z);
        const isDark = document.documentElement.classList.contains('dark');
        const projX = (p.x + mouseOffset.x * 0.25) * scale + width / 2;
        const projY = (p.y + mouseOffset.y * 0.25) * scale + height / 2;
        const radius = Math.max(0.7, p.size * scale);

        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(239, 68, 68, ${p.alpha * scale * 1.8})`
          : `rgba(37, 99, 235, ${p.alpha * scale * 1.3})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, isReducedMotion, mouseOffset.x, mouseOffset.y]);

  // Section 36.11: Dashboard Variant (Static/Very subtle, high performance)
  if (variant === 'dashboard') {
    return (
      <div
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      >
        {/* Subtle Watermark Imagery */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.05] dark:opacity-0 pointer-events-none transition-opacity duration-700"
          style={{ backgroundImage: 'url(/assets/bg-blue-mesh.jpg)' }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-0 dark:opacity-[0.14] pointer-events-none transition-opacity duration-700 mix-blend-screen"
          style={{ backgroundImage: 'url(/assets/bg-circuit-red.jpg)' }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-gradient-to-b from-blue-600/5 via-cyan-500/5 to-transparent dark:from-red-600/10 dark:via-rose-600/5 dark:to-transparent blur-[120px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[300px] bg-gradient-to-tr from-cyan-500/5 to-transparent dark:from-red-700/10 dark:to-transparent blur-[100px] rounded-full" />
      </div>
    );
  }

  // Section 36.10: Auth Variant (Soft animated gradient + 1 slow-drifting light orb)
  if (variant === 'auth') {
    return (
      <div
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      >
        {/* Subtle Watermark Imagery */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.06] dark:opacity-0 pointer-events-none transition-opacity duration-700"
          style={{ backgroundImage: 'url(/assets/bg-blue-mesh.jpg)' }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-0 dark:opacity-[0.16] pointer-events-none transition-opacity duration-700 mix-blend-screen"
          style={{ backgroundImage: 'url(/assets/bg-circuit-red.jpg)' }}
        />

        {/* Layer 1 Soft Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/[0.04] via-transparent to-cyan-500/[0.04] dark:from-red-950/[0.20] dark:via-transparent dark:to-rose-950/[0.12]" />

        {/* Technical IoT Schematic Watermark */}
        <IoTBlueprintWatermark mouseOffset={mouseOffset} className="scale-90 opacity-70" />

        {/* 1 Slow-drifting light orb */}
        <div
          className="absolute top-1/4 left-1/3 w-[550px] h-[400px] rounded-full bg-gradient-to-br from-blue-600/10 via-cyan-500/10 to-indigo-600/5 dark:from-red-600/20 dark:via-rose-600/15 dark:to-red-900/10 blur-[120px] animate-orb-a"
          style={{
            transform: `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 0)`,
          }}
        />

        <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />
      </div>
    );
  }

  // Section 36.9: Device Configuration Variant (Soft radial gradient with interactive pulse)
  if (variant === 'device-config') {
    return (
      <div
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      >
        {/* Subtle Watermark Imagery */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.06] dark:opacity-0 pointer-events-none transition-opacity duration-700"
          style={{ backgroundImage: 'url(/assets/bg-blue-mesh.jpg)' }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-0 dark:opacity-[0.16] pointer-events-none transition-opacity duration-700 mix-blend-screen"
          style={{ backgroundImage: 'url(/assets/bg-circuit-red.jpg)' }}
        />

        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] rounded-full blur-[130px] transition-all duration-700 ${
            configState === 'saved'
              ? 'bg-emerald-500/20 scale-110'
              : configState === 'changed'
              ? 'bg-cyan-500/20 dark:bg-red-500/25 scale-105'
              : 'bg-blue-600/10 dark:bg-red-600/20'
          }`}
        />
        {/* Technical IoT Schematic Watermark */}
        <IoTBlueprintWatermark mouseOffset={mouseOffset} className="scale-95 opacity-75" />
        <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />
      </div>
    );
  }

  // Section 36.1 & 36.2 & 36.7: Full Hero & Showcase Atmosphere
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500 ${className}`}
    >
      {/* =================================================================== */}
      {/* LAYER 0: Rich Watermark Artwork from User Images                     */}
      {/* =================================================================== */}
      {/* Light Mode: Subtle Cyber Blue Mesh Wave Watermark */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.07] dark:opacity-0 pointer-events-none transition-opacity duration-700"
        style={{
          backgroundImage: 'url(/assets/bg-blue-mesh.jpg)',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 25%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 25%, transparent 85%)',
        }}
      />

      {/* Dark Mode: Cyber Red Circuit Board Watermark */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-0 dark:opacity-[0.18] pointer-events-none transition-opacity duration-700 mix-blend-screen"
        style={{
          backgroundImage: 'url(/assets/bg-circuit-red.jpg)',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 30%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 30%, transparent 90%)',
        }}
      />

      {/* =================================================================== */}
      {/* LAYER 1: Soft Gradient Atmosphere (36.1)                            */}
      {/* =================================================================== */}
      <div
        className="absolute inset-0 opacity-70 dark:opacity-90 animate-atmosphere-drift"
        style={{
          transform: `translate3d(${mouseOffset.x * 0.2}px, ${mouseOffset.y * 0.2}px, 0)`,
        }}
      >
        {/* Soft Blue / Cyan ambient wash in Light, Red / Crimson in Dark */}
        <div className="absolute -top-32 -left-32 w-[750px] h-[550px] rounded-full bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-transparent dark:from-red-600/20 dark:via-rose-600/10 dark:to-transparent blur-[140px]" />
        
        {/* Soft Purple ambient wash in Light, Rose in Dark */}
        <div className="absolute top-1/3 -right-24 w-[650px] h-[500px] rounded-full bg-gradient-to-bl from-purple-600/5 via-indigo-500/5 to-transparent dark:from-rose-600/15 dark:via-red-700/10 dark:to-transparent blur-[140px]" />
        
        {/* Bottom Soft White/Cyan wash in Light, Red in Dark */}
        <div className="absolute -bottom-40 left-1/3 w-[800px] h-[450px] rounded-full bg-gradient-to-t from-cyan-500/5 via-blue-500/5 to-transparent dark:from-red-600/15 dark:via-rose-600/5 dark:to-transparent blur-[150px]" />
      </div>

      {/* =================================================================== */}
      {/* LAYER 1.5: Technical IoT Hardware Blueprint Watermark                */}
      {/* =================================================================== */}
      <IoTBlueprintWatermark mouseOffset={mouseOffset} />

      {/* =================================================================== */}
      {/* LAYER 2: Floating Light Orbs (36.1: 4-5 large diffuse orbs)         */}
      {/* =================================================================== */}
      {/* Orb 1: Royal Blue (Light) / Cyber Red (Dark) */}
      <div
        className="absolute top-12 left-1/4 w-[480px] h-[380px] rounded-full bg-blue-600/[0.07] dark:bg-red-600/[0.22] blur-[110px] animate-orb-a"
        style={{
          transform: `translate3d(${mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px, 0)`,
        }}
      />

      {/* Orb 2: Tech Cyan (Light) / Glowing Rose (Dark) */}
      <div
        className="absolute top-1/2 right-1/4 w-[420px] h-[340px] rounded-full bg-cyan-400/[0.06] dark:bg-rose-500/[0.18] blur-[115px] animate-orb-b"
        style={{
          transform: `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 0)`,
        }}
      />

      {/* Orb 3: Soft Violet (Light) / Deep Crimson (Dark) */}
      <div
        className="absolute bottom-20 left-1/3 w-[520px] h-[360px] rounded-full bg-indigo-500/[0.05] dark:bg-red-800/[0.18] blur-[125px] animate-orb-c"
        style={{
          transform: `translate3d(${mouseOffset.x * 0.5}px, ${mouseOffset.y * 0.5}px, 0)`,
        }}
      />

      {/* =================================================================== */}
      {/* LAYER 3: 3D Perspective Grid Background (36.2: vanishing depth)     */}
      {/* =================================================================== */}
      <div className="absolute inset-x-0 bottom-0 h-[45vh] grid-perspective-container opacity-40 dark:opacity-60">
        <div
          className="w-full h-[180%] grid-3d-plane opacity-70"
          style={{
            transform: `rotateX(62deg) translate3d(${mouseOffset.x * -0.3}px, 0, 0)`,
          }}
        />
      </div>

      {/* =================================================================== */}
      {/* LAYER 4: Sparse Micro 3D Particles (36.13: 20-30 max)               */}
      {/* =================================================================== */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-75 dark:opacity-85" />
    </div>
  );
};
