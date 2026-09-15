export function WalkMockup() {
  return (
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-[28px] border border-neutral-200 bg-linear-to-br from-[#eaf4ec] to-[#dcefe1] shadow-sm">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" aria-hidden>
        <defs>
          <pattern id="walk-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#walk-grid)" opacity="0.4" />

        {/* 공원 블록 */}
        <rect x="20" y="200" width="110" height="80" rx="16" fill="#bfe3c9" opacity="0.6" />
        {/* 하천 */}
        <path
          d="M0 60 C 90 30, 150 100, 260 70 S 420 40, 460 90"
          fill="none"
          stroke="#a9d3e8"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* 도로 */}
        <path d="M-10 250 C 120 210, 220 260, 410 170" fill="none" stroke="#ffffff" strokeWidth="7" opacity="0.75" />
        <path d="M180 -10 C 160 90, 210 140, 190 310" fill="none" stroke="#ffffff" strokeWidth="5" opacity="0.6" />
      </svg>

      {/* 안전 구역(지오펜스) */}
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#2f9e58]/50 bg-[#2f9e58]/10" />

      {/* 반려동물 위치 마커 */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-[calc(50%+1.5rem)] flex-col items-center gap-1">
        <span className="rounded-full border border-[#2f9e58] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#2f9e58] shadow-sm">
          보리
        </span>
        <span className="relative flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2f9e58] opacity-60" />
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-[#2f9e58]" />
        </span>
      </div>

      <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur">
        안전 구역 안에 있어요
      </div>
    </div>
  );
}
