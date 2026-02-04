'use client';

import { useState, useEffect } from 'react';

const FloatingParticles = () => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setMounted(true);
    // Generate consistent particles on client side
    setParticles(Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 8,
      duration: Math.random() * 6 + 6,
      opacity: Math.random() * 0.5 + 0.2,
    })));
  }, []);

  // Don't render particles on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Static background orbs for SSR */}
        <div 
          className="absolute w-64 h-64 rounded-full bg-glow-purple/5 blur-3xl animate-drift"
          style={{ left: '10%', top: '20%' }}
        />
        <div 
          className="absolute w-96 h-96 rounded-full bg-glow-cyan/5 blur-3xl animate-drift"
          style={{ right: '5%', top: '50%', animationDelay: '5s' }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full bg-glow-teal/5 blur-3xl animate-drift"
          style={{ left: '40%', bottom: '10%', animationDelay: '10s' }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-glow-cyan animate-float"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 3}px hsl(180 100% 50% / 0.6)`,
          }}
        />
      ))}
      
      {/* Larger ambient orbs */}
      <div 
        className="absolute w-64 h-64 rounded-full bg-glow-purple/5 blur-3xl animate-drift"
        style={{ left: '10%', top: '20%' }}
      />
      <div 
        className="absolute w-96 h-96 rounded-full bg-glow-cyan/5 blur-3xl animate-drift"
        style={{ right: '5%', top: '50%', animationDelay: '5s' }}
      />
      <div 
        className="absolute w-80 h-80 rounded-full bg-glow-teal/5 blur-3xl animate-drift"
        style={{ left: '40%', bottom: '10%', animationDelay: '10s' }}
      />
    </div>
  );
};

export default FloatingParticles;

