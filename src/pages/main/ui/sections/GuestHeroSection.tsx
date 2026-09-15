import DoDoLogo from '@/shared/assets/images/Logo_light.svg?react';

export function GuestHeroSection() {
  return (
    <section className="relative z-0 px-6 py-16 text-center sm:py-20">
      {/* 뷰포트 전체 폭으로 빠져나가되, 위쪽은 헤더 바로 아래부터(침범 금지), 아래쪽만 여유를 둬서 경계가 뚝 끊기지 않게 */}
      <div className="pointer-events-none absolute -bottom-40 left-1/2 top-0 -z-10 w-screen -translate-x-1/2 overflow-hidden">
        <div className="animate-aurora-1 absolute -left-16 top-[-10%] h-72 w-72 rounded-full bg-brand/10 blur-3xl sm:h-96 sm:w-96" />
        <div className="animate-aurora-2 absolute -right-20 top-[15%] h-64 w-64 rounded-full bg-secondary/10 blur-3xl sm:h-80 sm:w-80" />
      </div>

      <div className="relative flex flex-col items-center">
        <DoDoLogo className="animate-enter-soft h-14 w-auto sm:h-16" />

        <h1 className="animate-enter-soft-delay mt-8 max-w-2xl font-display text-[28px] font-bold leading-tight text-neutral-950 sm:text-[42px]">
          반려동물과의 모든 순간,
          <br />
          <span className="text-brand">도도</span>와 함께 기록해요
        </h1>
        <p className="animate-enter-soft-delay mt-5 max-w-md text-[15px] leading-7 text-neutral-600 sm:text-base">
          산책 안전, AI 건강 리포트, 커뮤니티까지 —
          <br />
          반려동물과 보내는 일상을 도도 하나로 관리하세요.
        </p>
      </div>
    </section>
  );
}
