import { useState } from 'react';

import { LoginModal, redirectToSocialLogin } from '@/features/auth';

import { CommunityMockup } from './mockups/CommunityMockup';
import { HealthMockup } from './mockups/HealthMockup';
import { NotificationMockup } from './mockups/NotificationMockup';
import { WalkMockup } from './mockups/WalkMockup';
import { FeatureRevealSection } from './sections/FeatureRevealSection';
import { GuestHeroSection } from './sections/GuestHeroSection';

export function GuestHome() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="-mt-6 flex w-full flex-col">
      <GuestHeroSection />

      <div className="mt-10 divide-y divide-neutral-100 sm:mt-14">
        <FeatureRevealSection
          eyebrow="Walk & Safety"
          title="안전 구역을 벗어나면 바로 알려드려요"
          description="반려동물별로 안전 구역을 설정해두면, 실시간 위치를 추적하다가 구역을 벗어나는 순간 바로 알림을 보내드려요."
          visual={<WalkMockup />}
        />
        <FeatureRevealSection
          eyebrow="AI Health Report"
          title={
            <>
              산책과 활동 기록으로 만드는
              <br />
              건강 리포트
            </>
          }
          description="일상 기록을 바탕으로 AI가 반려동물의 건강 상태를 분석하고, 필요한 관리 방법까지 알려드려요."
          visual={<HealthMockup />}
          reverse
        />
        <FeatureRevealSection
          eyebrow="Community"
          title="같은 마음을 가진 집사들과 함께해요"
          description="산책 사진과 일상을 나누고, 다른 반려동물 가족들의 이야기에 공감하며 소통할 수 있어요."
          visual={<CommunityMockup />}
        />
        <FeatureRevealSection
          eyebrow="Notification"
          title="중요한 순간을 놓치지 않도록"
          description="댓글, 반응, 건강 리포트까지 — 반려동물과 커뮤니티의 소식을 알림함 하나로 모아 확인하세요."
          visual={<NotificationMockup />}
          reverse
        />
      </div>

      <section className="mt-6 flex flex-col items-center gap-5 rounded-[28px] bg-neutral-50 px-6 py-20 text-center sm:py-24">
        <h2 className="font-display text-2xl font-bold text-neutral-950 sm:text-[32px]">
          지금 도도와 함께 시작해보세요
        </h2>
        <p className="max-w-md text-[15px] leading-7 text-neutral-600">
          가입은 1분이면 충분해요. 네이버, 구글 계정으로 바로 시작할 수 있어요.
        </p>
        <button
          type="button"
          onClick={() => setIsLoginOpen(true)}
          className="group relative mt-2 h-14 min-w-48 overflow-hidden rounded-2xl bg-linear-to-r from-brand to-secondary px-8 text-[15px] font-semibold text-brand-foreground shadow-[0_12px_28px_rgba(229,108,49,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(229,108,49,0.28)]"
        >
          <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/25 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute -right-8 top-0 h-full w-20 rotate-12 bg-white/20 blur-2xl transition-transform duration-500 group-hover:-translate-x-6" />
          <span className="relative">무료로 시작하기</span>
        </button>
      </section>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSelectProvider={redirectToSocialLogin} />
    </div>
  );
}
