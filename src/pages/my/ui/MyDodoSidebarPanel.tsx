import { useState } from 'react';

import type { UserProfile } from '@/features/auth/model/types';
import { MY_DODO_MENU_ITEMS, type MyDodoMenuKey } from '@/pages/my/model/menu';
import { MyDodoProfileCard } from '@/pages/my/ui/MyDodoProfileCard';
import { MyDodoSidebar } from '@/pages/my/ui/MyDodoSidebar';

interface MyDodoSidebarPanelProps {
  user: UserProfile | null;
  profileUrl: string | null;
  displayName: string;
  isLoading?: boolean;
  activeKey: MyDodoMenuKey;
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function MyDodoSidebarPanel({
  user,
  profileUrl,
  displayName,
  isLoading = false,
  activeKey,
}: MyDodoSidebarPanelProps) {
  // 모바일(xl 미만)에서는 메뉴를 기본적으로 접어두고 햄버거 버튼으로 펼침 — xl 이상은 항상 펼쳐진 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeLabel = MY_DODO_MENU_ITEMS.find((item) => item.key === activeKey)?.label ?? '마이도도';

  return (
    <div className="rounded-[22px] border border-white/80 bg-linear-to-b from-white to-neutral-50 shadow-[0_12px_28px_rgba(15,23,42,0.05)] xl:h-full">
      {/* 모바일 전용: 현재 메뉴명 + 햄버거 버튼만 보이는 축약 바 */}
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 xl:hidden"
      >
        <span className="text-[15px] font-semibold text-neutral-900">{activeLabel}</span>
        {isMenuOpen ? (
          <CloseIcon className="h-5 w-5 shrink-0 text-neutral-500" />
        ) : (
          <HamburgerIcon className="h-5 w-5 shrink-0 text-neutral-500" />
        )}
      </button>

      <div
        className={[
          isMenuOpen ? 'block' : 'hidden',
          'border-t border-neutral-200/80 px-5 pb-6 pt-5',
          'xl:block xl:border-t-0 xl:px-5 xl:py-6',
        ].join(' ')}
      >
        <MyDodoProfileCard user={user} profileUrl={profileUrl} displayName={displayName} isLoading={isLoading} />
        <MyDodoSidebar activeKey={activeKey} onNavigate={() => setIsMenuOpen(false)} />
      </div>
    </div>
  );
}
