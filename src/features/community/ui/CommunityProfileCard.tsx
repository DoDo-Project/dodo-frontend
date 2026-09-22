import { Link } from 'react-router-dom';

import profileDefaultIllustration from '@/features/auth/assets/profile-default.svg';

interface CommunityProfileCardProps {
  profileUrl: string | null;
  nickname: string | null;
}

const PROFILE_COPY = {
  fallbackName: '도도 친구',
  description: '이야기를 글로 기록해보세요.',
  write: '글쓰기',
  myActivity: '내 활동',
};

export function CommunityProfileCard({ profileUrl, nickname }: CommunityProfileCardProps) {
  const resolvedName = nickname?.trim() || PROFILE_COPY.fallbackName;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
          <img
            src={profileUrl?.trim() || profileDefaultIllustration}
            alt=""
            className="block h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = profileDefaultIllustration;
            }}
          />
        </div>
        <div>
          <p className="text-lg font-semibold text-neutral-950">{resolvedName}</p>
          <p className="mt-1 text-sm leading-6 text-neutral-500">{PROFILE_COPY.description}</p>
        </div>
      </div>

      {/* 모바일: 카드가 콘텐츠보다 먼저 보이므로 버튼을 가로로 배치해 공간 절약 / lg 이상: 기존처럼 세로 스택 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <Link
          to="/community/new"
          className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[inset_0_0_0_1px_rgba(229,229,229,1)] transition-colors hover:bg-neutral-50"
        >
          {PROFILE_COPY.write}
        </Link>
        <Link
          to="/community/my"
          className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          {PROFILE_COPY.myActivity}
        </Link>
      </div>
    </section>
  );
}
