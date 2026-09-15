const POSTS = [
  { name: '자유로운산책', time: '10분 전', text: '오늘 한강에서 만난 친구들 🐕', likes: 24 },
  { name: '도도집사', time: '1시간 전', text: '첫 산책 데뷔, 어색해도 잘했어요!', likes: 12 },
];

export function CommunityMockup() {
  return (
    <div className="aspect-4/3 w-full overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold text-neutral-900">커뮤니티</p>
        <span className="text-xs font-medium text-neutral-400">인기 게시글</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {POSTS.map((post) => (
          <article key={post.name} className="rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 shrink-0 rounded-full bg-brand/15" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-neutral-800">{post.name}</p>
                <p className="text-[11px] text-neutral-400">{post.time}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-neutral-500">
                ❤️ {post.likes}
              </span>
            </div>
            <p className="mt-2 truncate text-[13px] text-neutral-700">{post.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
