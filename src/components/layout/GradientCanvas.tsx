import { useEffect, useRef } from 'react';

const COLORS = ['#93c5fd', '#c4b5fd', '#99f6e4'] as const;

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

function createBlobs(width: number, height: number): Blob[] {
  return COLORS.map((color) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    radius: 300 + Math.random() * 200,
    color,
  }));
}

export function GradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<Blob[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    let lastTick = 0;
    const FPS = 30;
    const interval = 1000 / FPS;

    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate);
      if (now - lastTick < interval) return;
      lastTick = now;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f4f6f8';
      ctx.fillRect(0, 0, width, height);

      blobsRef.current.forEach((blob) => {
        blob.x += blob.vx;
        blob.y += blob.vy;
        if (blob.x < -blob.radius || blob.x > width + blob.radius) blob.vx *= -1;
        if (blob.y < -blob.radius || blob.y > height + blob.radius) blob.vy *= -1;

        const g = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        g.addColorStop(0, blob.color);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    blobsRef.current = createBlobs(window.innerWidth, window.innerHeight);
    resize();
    rafRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="gradient-canvas"
      className="fixed inset-0 z-0 h-full w-full pointer-events-none"
      style={{ opacity: 0.4 }}
      aria-hidden
    />
  );
}
