import React, { useState, useRef, useEffect } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 10,
  glareOpacity = 0.22,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect if device is primarily touch-based
    if (window.matchMedia('(hover: none)').matches) {
      setIsTouchDevice(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = -((y - centerY) / centerY) * maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    setTilt({ x: tiltX, y: tiltY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: glareOpacity
    });
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: isTouchDevice ? 'none' : '1000px',
        transformStyle: isTouchDevice ? 'flat' : 'preserve-3d'
      }}
      className={`relative cursor-pointer transition-transform duration-200 ease-out ${className}`}
    >
      <div
        style={{
          transform: !isTouchDevice && isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out'
        }}
        className="w-full h-full relative rounded-2xl overflow-hidden glass-panel border border-[#FF9F1C]/20 hover:border-[#FF9F1C]/50 shadow-xl"
      >
        {/* Dynamic Specular Glare Overlay (desktop only) */}
        {!isTouchDevice && (
          <div
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, transparent 65%)`,
              transition: isHovered ? 'opacity 0.1s' : 'opacity 0.4s'
            }}
            className="absolute inset-0 pointer-events-none z-20"
          />
        )}

        {/* Inner Card Content with 3D Depth on hover */}
        <div
          style={{ transform: !isTouchDevice && isHovered ? 'translateZ(20px)' : 'translateZ(0px)' }}
          className="transition-transform duration-200 relative z-10 h-full flex flex-col justify-between"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
