import { useRef, useEffect, useCallback } from 'react';

// Interactive confetti/particle canvas that reacts to mouse movement
export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  const COLORS = [
    '#7c3aed', // violet-600
    '#6366f1', // indigo-500
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#8b5cf6', // violet-500
    '#a78bfa', // violet-400
    '#818cf8', // indigo-400
  ];

  const SHAPES = ['circle', 'square', 'triangle', 'line'];

  const createParticle = useCallback((width, height) => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      originX: 0,
      originY: 0,
      size: Math.random() * 6 + 3, // slightly larger
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: Math.random() * 0.6 + 0.3, // more visible
      speedX: (Math.random() - 0.5) * 0.6, // twice as fast base drift
      speedY: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      shape,
    };
  }, []);

  const initParticles = useCallback((width, height) => {
    const count = Math.min(Math.floor((width * height) / 2500), 200); // more particles
    const particles = [];
    for (let i = 0; i < count; i++) {
      const p = createParticle(width, height);
      p.originX = p.x;
      p.originY = p.y;
      particles.push(p);
    }
    particlesRef.current = particles;
  }, [createParticle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      initParticles(width, height);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.parentElement.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

    const drawParticle = (p) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      switch (p.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, p.size);
          ctx.lineTo(-p.size, p.size);
          ctx.closePath();
          ctx.fill();
          break;
        case 'line':
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-p.size * 1.5, 0);
          ctx.lineTo(p.size * 1.5, 0);
          ctx.stroke();
          break;
      }
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const influence = 250; // larger mouse influence radius

      for (const p of particlesRef.current) {
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < influence && dist > 0) {
          const force = (influence - dist) / influence;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 8; // stronger push
          p.y += Math.sin(angle) * force * 8;
          p.opacity = Math.min(p.opacity + 0.05, 0.9);
          p.rotationSpeed = (Math.random() - 0.5) * 0.08;
        } else {
          // Drift back to origin slowly
          p.x += (p.originX - p.x) * 0.008 + p.speedX;
          p.y += (p.originY - p.y) * 0.008 + p.speedY;
          p.opacity += (0.25 - p.opacity) * 0.01;
        }

        // Rotation
        p.rotation += p.rotationSpeed;

        // Wrap around edges
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        drawParticle(p);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: 1,
        maskImage: 'radial-gradient(ellipse at center, transparent 20%, black 50%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black 50%)'
      }}
    />
  );
}
