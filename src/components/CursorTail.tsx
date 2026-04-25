import React, { useEffect, useRef } from "react";

export default function CursorTail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const points = useRef<{ x: number; y: number }[]>([]);
  const segmentCount = 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    // Initialize points
    for (let i = 0; i < segmentCount; i++) {
      points.current.push({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let head = points.current[0];
      head.x += (mouse.current.x - head.x) * 0.4;
      head.y += (mouse.current.y - head.y) * 0.4;

      for (let i = 1; i < segmentCount; i++) {
        const p = points.current[i];
        const next = points.current[i - 1];
        
        // Smooth follow logic with elastic feel
        p.x += (next.x - p.x) * 0.35;
        p.y += (next.y - p.y) * 0.35;
      }

      // Draw the snake-like path
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      for (let i = 0; i < segmentCount - 1; i++) {
        const p1 = points.current[i];
        const p2 = points.current[i + 1];
        
        const hue = (Date.now() / 8 + i * 12) % 360;
        const width = (segmentCount - i) * 1.8;
        const opacity = (segmentCount - i) / segmentCount;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${opacity * 0.6})`;
        ctx.lineWidth = width;
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsla(${hue}, 100%, 65%, ${opacity * 0.5})`;
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[80] mix-blend-screen opacity-100"
    />
  );
}
