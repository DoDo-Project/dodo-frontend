import type { ReactNode } from 'react';

interface CommunityLayoutProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  sidebar?: ReactNode;
  content: ReactNode;
}

export function CommunityLayout({ eyebrow, title, description, sidebar, content }: CommunityLayoutProps) {
  const hasHeader = Boolean(eyebrow || title || description);
  const contentGridClass = sidebar ? 'lg:grid-cols-[minmax(0,1fr)_240px]' : 'lg:grid-cols-1';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {hasHeader ? (
        <div>
          {eyebrow ? <p className="text-xs font-semibold tracking-[0.24em] text-brand">{eyebrow}</p> : null}
          {title ? <h1 className="mt-2 text-[18px] font-medium text-neutral-950 sm:text-[20px]">{title}</h1> : null}
          {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">{description}</p> : null}
        </div>
      ) : null}

      <div className={[hasHeader ? 'mt-10' : '', 'grid items-start gap-6', contentGridClass].join(' ').trim()}>
        <div className="min-w-0 space-y-6">{content}</div>
        {/* 모바일에서는 프로필/글쓰기 카드가 콘텐츠보다 먼저 보이도록 순서를 위로 올림 */}
        {sidebar ? <aside className="order-first space-y-6 lg:order-0 lg:sticky lg:top-8">{sidebar}</aside> : null}
      </div>
    </div>
  );
}
