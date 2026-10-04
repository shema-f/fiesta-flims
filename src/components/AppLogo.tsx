import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export default function AppLogo({ className = '', size = 32, glow = false }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${glow ? 'drop-shadow-[0_0_12px_rgba(249,115,22,0.45)]' : ''} ${className}`}
    >
      <defs>
        {/* Main front ribbon face gradient */}
        <linearGradient id="fiestaFrontGrad" x1="50" y1="30" x2="160" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFA133" />
          <stop offset="35%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Top curved loop outer highlight */}
        <linearGradient id="fiestaTopLoop" x1="40" y1="90" x2="110" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="60%" stopColor="#FFA63D" />
          <stop offset="100%" stopColor="#FF7A00" />
        </linearGradient>

        {/* 3D Underside fold shadow */}
        <linearGradient id="fiestaFoldShadow" x1="50" y1="50" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B43800" />
          <stop offset="50%" stopColor="#8C2800" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>

        {/* Middle arm fold shadow */}
        <linearGradient id="fiestaMidFold" x1="60" y1="85" x2="95" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9A2C00" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Vertical stem gradient */}
        <linearGradient id="fiestaStem" x1="45" y1="110" x2="75" y2="175" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#D94800" />
        </linearGradient>
      </defs>

      {/* 1. Underside / Inner twist shadow facet behind the fold */}
      <path
        d="M 50 82 C 50 64 64 50 82 50 L 98 50 L 72 82 Z"
        fill="url(#fiestaFoldShadow)"
      />

      {/* 2. Top Folded Ribbon Bar (Extends horizontally to the right) */}
      <path
        d="M 80 34 L 152 34 L 152 64 L 88 64 C 80 64 74 58 74 50 C 74 41 80 34 88 34 Z"
        fill="url(#fiestaFrontGrad)"
      />

      {/* 3. The Outer Curving Loop Ribbon (Sweeps up from the left stem over to top bar) */}
      <path
        d="M 50 114 L 50 78 C 50 48 70 34 94 34 L 86 44 C 70 44 60 54 60 70 L 60 114 Z"
        fill="url(#fiestaTopLoop)"
      />

      {/* 4. Middle Horizontal Arm (Folds out from stem to the right) */}
      <path
        d="M 60 94 L 134 94 L 124 122 L 60 122 Z"
        fill="url(#fiestaFrontGrad)"
      />

      {/* 5. Middle arm 3D depth crease facet */}
      <path
        d="M 60 94 L 86 94 L 60 122 Z"
        fill="url(#fiestaMidFold)"
        opacity="0.85"
      />

      {/* 6. Lower Vertical Stem with dynamic angled cut at the base */}
      <path
        d="M 50 114 L 74 114 L 74 162 L 50 172 Z"
        fill="url(#fiestaStem)"
      />
    </svg>
  );
}
