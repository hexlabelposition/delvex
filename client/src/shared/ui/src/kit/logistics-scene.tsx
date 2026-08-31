interface IsoCubeProps {
  /** Centre of the top face. */
  x: number;
  y: number;
  /** Half-width of the top face. */
  size: number;
  height: number;
  tone: "solid" | "light";
}

/**
 * One isometric crate, drawn as three faces so the light catches them the way
 * it does in the Open Graph illustration.
 */
function IsoCube({ x, y, size, height, tone }: IsoCubeProps) {
  const top = `${x},${y} ${x + size},${y + size / 2} ${x},${y + size} ${x - size},${y + size / 2}`;
  const left = `${x - size},${y + size / 2} ${x},${y + size} ${x},${y + size + height} ${x - size},${y + size / 2 + height}`;
  const right = `${x + size},${y + size / 2} ${x},${y + size} ${x},${y + size + height} ${x + size},${y + size / 2 + height}`;

  if (tone === "solid") {
    return (
      <g>
        <polygon points={top} className="fill-primary/80" />
        <polygon points={left} className="fill-primary" />
        <polygon points={right} className="fill-primary/60" />
      </g>
    );
  }

  return (
    <g>
      <polygon points={top} className="fill-foreground/8" />
      <polygon points={left} className="fill-foreground/12" />
      <polygon points={right} className="fill-foreground/5" />
    </g>
  );
}

function RouteNode({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={8} className="fill-primary/70" />
      <circle cx={x} cy={y} r={3} className="fill-muted" />
    </g>
  );
}

/**
 * The Delvex visual language from `public/og.png`, rebuilt on theme tokens so
 * it stays crisp at any size and follows the dark theme. It is background
 * texture: everything here stays quiet enough for text to sit on top.
 */
export function LogisticsScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 820"
      fill="none"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="delvex-dots"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.8" className="fill-primary/20" />
        </pattern>
      </defs>

      <rect x="392" y="556" width="120" height="120" fill="url(#delvex-dots)" />
      <rect x="150" y="52" width="90" height="90" fill="url(#delvex-dots)" />

      {/* Routes: long sweeping lines that tie the crates together. */}
      <g className="stroke-primary/20" strokeWidth="1.5" fill="none">
        <path d="M-20 236 C 130 236, 150 128, 300 128 S 470 236, 620 236" />
        <path d="M-20 664 C 120 664, 160 556, 300 556 S 480 648, 620 630" />
      </g>

      <g
        className="stroke-primary/35 motion-safe:animate-route"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="8 12"
        fill="none"
      >
        <path d="M-20 278 C 140 278, 150 176, 300 176 S 470 278, 620 278" />
        <path d="M-20 622 C 130 622, 170 520, 300 520 S 480 610, 620 592" />
      </g>

      <RouteNode x={112} y={231} />
      <RouteNode x={488} y={231} />
      <RouteNode x={158} y={640} />
      <RouteNode x={462} y={620} />

      {/* Crates sit on the right and along the top; the lower left is left
          quiet because the panel copy lives there. */}
      <IsoCube x={498} y={58} size={44} height={32} tone="solid" />
      <IsoCube x={534} y={432} size={34} height={26} tone="solid" />
      <IsoCube x={478} y={712} size={50} height={36} tone="solid" />
      <IsoCube x={300} y={74} size={30} height={22} tone="light" />
      <IsoCube x={556} y={244} size={26} height={18} tone="light" />
      <IsoCube x={118} y={366} size={34} height={24} tone="light" />

      {/* The hero crate, drawn as line art like the Open Graph image. */}
      <g
        className="stroke-primary/70"
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      >
        <polygon points="378,244 470,290 470,394 378,440 286,394 286,290" />
        <polyline points="286,290 378,336 470,290" />
        <line x1="378" y1="336" x2="378" y2="440" />
        <polyline points="332,267 424,313 424,339 406,330 406,356 378,336" />
      </g>
    </svg>
  );
}
