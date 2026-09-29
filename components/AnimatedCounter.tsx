'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  label: string;
  duration?: number;
}

export default function AnimatedCounter({ value, label, duration = 2 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        
        // Ease out quad
        const easeOut = progress * (2 - progress);
        setCount(Math.floor(easeOut * value));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setCount(value);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, value, duration]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5 }}
        style={{ 
          fontSize: '3rem', 
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          color: 'var(--accent)',
          textShadow: '0 0 20px var(--accent-glow)'
        }}
      >
        {/* BUG-10: render the real value until the count-up animation takes over,
            so SSR/static markup never shows "0" for a non-zero stat. */}
        {isInView ? count : value}{value > 50 ? '+' : ''}
      </motion.div>
      <div style={{ color: 'var(--text-muted)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label}
      </div>
    </div>
  );
}
