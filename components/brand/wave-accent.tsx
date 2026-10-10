"use client";

interface WaveAccentProps {
  className?: string;
  variant?: "hero" | "subtle" | "banner";
}

export function WaveAccent({ className = "", variant = "hero" }: WaveAccentProps) {
  if (variant === "subtle") {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden -z-10 ${className}`}
        aria-hidden="true"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-violet-100/50 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-cyan-100/50 blur-3xl" />
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden -z-10 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Porcelain base ambient meshes */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] opacity-80">
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/70 via-indigo-50/60 to-purple-100/50 rounded-[100%] blur-3xl transform -rotate-6" />
      </div>

      <div className="absolute top-20 right-[5%] w-[600px] h-[450px] bg-gradient-to-br from-teal-50/80 via-cyan-100/50 to-blue-100/40 rounded-full blur-3xl opacity-70" />
      <div className="absolute top-48 left-[5%] w-[550px] h-[400px] bg-gradient-to-tr from-purple-100/50 via-pink-50/40 to-sky-100/50 rounded-full blur-3xl opacity-60" />

      {/* SVG flowing wave ribbons - crisp watercolor gradient paths */}
      <svg
        className="absolute top-0 left-0 w-full h-[640px] opacity-40 mix-blend-multiply"
        viewBox="0 0 1440 640"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wave-grad-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#818CF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="wave-grad-b" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <path
          d="M0,160 C320,300 480,80 800,200 C1120,320 1280,140 1440,220 L1440,0 L0,0 Z"
          fill="url(#wave-grad-a)"
        />
        <path
          d="M0,240 C360,120 640,340 960,180 C1200,60 1360,260 1440,190 L1440,0 L0,0 Z"
          fill="url(#wave-grad-b)"
        />
      </svg>

      {/* Subtle fine hairline grid to give architectural precision, not dark hacker vibes */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f018_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f018_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
}
