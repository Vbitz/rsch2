'use client';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`select-none font-mono ${className}`}>
      <div className="text-xl font-bold tracking-wider">
        <span className="text-white">R</span>
        <span className="text-[var(--accent)]">S</span>
        <span className="text-white">C</span>
        <span className="text-[var(--muted)]">H</span>
      </div>
    </div>
  );
}