const BARS = [38, 62, 46, 74, 58, 90, 66];

export function HealthMockup() {
  return (
    <div className="aspect-4/3 w-full overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-brand uppercase">AI Health Report</p>
          <p className="mt-1 text-[15px] font-bold text-neutral-900">보리의 이번 주 활동량</p>
        </div>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">양호</span>
      </div>

      <div className="mt-6 flex h-24 items-end gap-2">
        {BARS.map((height, index) => (
          <div
            key={index}
            className={`flex-1 rounded-t-md ${index === BARS.length - 2 ? 'bg-brand' : 'bg-brand/20'}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-neutral-50 px-3.5 py-3 text-[13px] leading-6 text-neutral-600">
        지난주보다 산책 거리가 <span className="font-semibold text-neutral-900">12% 늘었어요</span>. 이 페이스를
        유지해보세요!
      </div>
    </div>
  );
}
