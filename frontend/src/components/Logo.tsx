function Logo({ size = 34 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="logo-icon"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="55%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </defs>
            {/* Stem of the "L" */}
            <rect x="10" y="4" width="11" height="26" rx="5.5" fill="url(#logoGradient)" />
            {/* Infinity loop tail */}
            <path
                d="M15 44 C15 34 23 34 31 44 C39 54 47 54 47 44 C47 34 39 34 31 44 C23 54 15 54 15 44 Z"
                stroke="url(#logoGradient)"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}

export default Logo;