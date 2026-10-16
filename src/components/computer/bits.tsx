import type { ReactNode } from "react";

const SEGMENTS: Record<string, number[]> = {
  "0": [1, 1, 1, 1, 1, 1, 0],
  "1": [0, 1, 1, 0, 0, 0, 0],
  "2": [1, 1, 0, 1, 1, 0, 1],
  "3": [1, 1, 1, 1, 0, 0, 1],
  "4": [0, 1, 1, 0, 0, 1, 1],
  "5": [1, 0, 1, 1, 0, 1, 1],
  "6": [1, 0, 1, 1, 1, 1, 1],
  "7": [1, 1, 1, 0, 0, 0, 0],
  "8": [1, 1, 1, 1, 1, 1, 1],
  "9": [1, 1, 1, 1, 0, 1, 1],
  " ": [0, 0, 0, 0, 0, 0, 0],
};

export function Led({ on, tone = "lime" }: { on: boolean; tone?: "lime" | "red" }) {
  const lit = tone === "red" ? "bg-vermillion shadow-[0_0_10px_#ff3311]" : "bg-lime shadow-[0_0_10px_#d6ff3c]";
  return (
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full border-[2px] ${
        on ? `border-ink ${lit}` : "border-[#555] bg-[#1a1a1a]"
      }`}
    />
  );
}

export function bitsOf(value: number, width = 8) {
  return Array.from({ length: width }, (_, index) => ((value >> (width - 1 - index)) & 1) as 0 | 1);
}

export function Bits({
  value,
  width = 8,
  tone = "lime",
}: {
  value: number;
  width?: number;
  tone?: "lime" | "red";
}) {
  return (
    <div className="flex items-center gap-1">
      {bitsOf(value, width).map((bit, index) => (
        <Led key={index} on={bit === 1} tone={tone} />
      ))}
    </div>
  );
}

export function Dip({
  value,
  width = 8,
  onChange,
}: {
  value: number;
  width?: number;
  onChange: (next: number) => void;
}) {
  const bits = bitsOf(value, width);
  return (
    <div className="flex gap-1">
      {bits.map((bit, index) => {
        const place = width - 1 - index;
        return (
          <button
            key={place}
            type="button"
            aria-label={`bit ${place} ${bit}`}
            onClick={() => onChange(value ^ (1 << place))}
            className="flex w-5 flex-col items-center gap-0.5 border-[2px] border-ink bg-ink p-0.5"
          >
            <span className={`h-3 w-full ${bit ? "bg-lime" : "bg-[#333]"}`} />
            <span className={`h-3 w-full ${bit ? "bg-[#333]" : "bg-cream"}`} />
          </button>
        );
      })}
    </div>
  );
}

export function Hex({ value, width = 2 }: { value: number; width?: number }) {
  return (
    <span className="font-mono text-sm">
      0x{value.toString(16).toUpperCase().padStart(width, "0")}
    </span>
  );
}

export function Digit({ value }: { value: string }) {
  const segs = SEGMENTS[value] ?? SEGMENTS[" "];
  const on = "#ff3311";
  const off = "#3a1814";
  return (
    <svg viewBox="0 0 46 80" className="h-[72px] w-[42px]">
      <rect width="46" height="80" fill="#111" />
      <rect x="10" y="6" width="26" height="6" rx="1" fill={segs[0] ? on : off} />
      <rect x="34" y="12" width="6" height="24" fill={segs[1] ? on : off} />
      <rect x="34" y="44" width="6" height="24" fill={segs[2] ? on : off} />
      <rect x="10" y="68" width="26" height="6" fill={segs[3] ? on : off} />
      <rect x="6" y="44" width="6" height="24" fill={segs[4] ? on : off} />
      <rect x="6" y="12" width="6" height="24" fill={segs[5] ? on : off} />
      <rect x="10" y="37" width="26" height="6" fill={segs[6] ? on : off} />
    </svg>
  );
}

export function SevenSeg({ value }: { value: number }) {
  const text = String(value & 0xff).padStart(3, " ");
  return (
    <div className="flex gap-1 bg-ink p-2">
      {text.split("").map((ch, index) => (
        <Digit key={index} value={ch === " " ? " " : ch} />
      ))}
    </div>
  );
}

export function Module({
  tag,
  title,
  chip,
  active,
  inspecting,
  onInspect,
  lane,
  children,
}: {
  tag: string;
  title: string;
  chip?: string;
  active?: boolean;
  inspecting?: boolean;
  onInspect?: () => void;
  lane?: "drive" | "latch";
  children: ReactNode;
}) {
  return (
    <section
      className={`flex min-w-0 flex-col border-[3px] border-ink ${
        inspecting ? "bg-cream ring-4 ring-vermillion ring-offset-0" : active ? "bg-lime" : "bg-cream"
      }`}
    >
      <header className="flex items-center justify-between gap-2 border-b-[3px] border-ink bg-ink px-2 py-1">
        <button
          type="button"
          onClick={onInspect}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
        >
          <span className="font-mono text-[10px] tracking-[0.18em] text-lime">{tag}</span>
          <span className="font-poster text-sm text-cream">{title}</span>
          {lane === "drive" && (
            <span className="shrink-0 bg-lime px-1 font-mono text-[9px] text-ink">→总线</span>
          )}
          {lane === "latch" && (
            <span className="shrink-0 bg-vermillion px-1 font-mono text-[9px] text-cream">锁存←</span>
          )}
          <span
            className={`shrink-0 border border-lime px-1.5 py-0.5 font-mono text-[9px] tracking-widest ${
              inspecting ? "bg-vermillion text-cream" : "text-lime"
            }`}
          >
            {inspecting ? "剖开" : "内部"}
          </span>
        </button>
        {chip ? <span className="hidden font-mono text-[10px] text-lime/70 xl:inline">{chip}</span> : null}
      </header>
      <div className="flex flex-1 flex-col gap-2 p-2">{children}</div>
    </section>
  );
}
