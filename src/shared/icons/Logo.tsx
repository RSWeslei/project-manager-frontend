import { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="1" stopColor="#d4d4d4" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#g)" />
      <path d="M14 30c6 4 14 4 20 0" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="20" r="2" fill="#0a0a0a" />
      <circle cx="30" cy="20" r="2" fill="#0a0a0a" />
    </svg>
  );
};
