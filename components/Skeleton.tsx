'use client';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export default function Skeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px',
  style = {}
}: SkeletonProps) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--border)',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <style jsx>{`
        .skeleton::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.05) 20%,
            rgba(255, 255, 255, 0.1) 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export const CardSkeleton = () => (
  <div style={{ 
    background: 'var(--bg-secondary)', 
    borderRadius: '24px', 
    padding: '24px', 
    border: '1px solid var(--border)',
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <Skeleton height="200px" borderRadius="16px" />
    <Skeleton width="60%" height="1.5rem" />
    <Skeleton width="100%" height="3rem" />
    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
      <Skeleton width="80px" height="24px" borderRadius="12px" />
      <Skeleton width="80px" height="24px" borderRadius="12px" />
    </div>
  </div>
);
