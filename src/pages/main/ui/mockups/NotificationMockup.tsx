const NOTICES = [
  { title: '보리가 산책을 시작했어요', time: '방금', unread: true },
  { title: '댓글이 3개 달렸어요', time: '15분 전', unread: true },
  { title: 'AI 건강 리포트가 도착했어요', time: '어제', unread: false },
];

export function NotificationMockup() {
  return (
    <div className="aspect-4/3 w-full overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          🔔
        </span>
        <p className="text-[15px] font-bold text-neutral-900">알림함</p>
        <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-foreground">
          2
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {NOTICES.map((notice) => (
          <div
            key={notice.title}
            className="flex items-center gap-2.5 rounded-xl border border-neutral-100 px-3 py-2.5"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${notice.unread ? 'bg-brand' : 'bg-neutral-200'}`}
              aria-hidden
            />
            <p className="min-w-0 flex-1 truncate text-[13px] text-neutral-700">{notice.title}</p>
            <span className="shrink-0 text-[11px] text-neutral-400">{notice.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
