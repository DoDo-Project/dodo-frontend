import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { LoginModal, redirectToSocialLogin } from '@/features/auth';
import DoDoLogo from '@/shared/assets/images/Logo_light.svg?react';

import { useIsLoggedIn } from '../model/useIsLoggedIn';
import { ProfileMenu } from './ProfileMenu';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  ['text-sm transition-colors', isActive ? 'font-semibold text-brand' : 'text-neutral-700 hover:text-brand'].join(' ');

function GuestNav() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center gap-8" aria-label="비로그인 메뉴">
        <NavLink to="/" end className={linkClass}>
          서비스 소개
        </NavLink>
        <button
          type="button"
          onClick={() => setIsLoginOpen(true)}
          className="text-sm text-neutral-700 transition-colors hover:text-brand"
        >
          시작하기
        </button>
      </nav>
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSelectProvider={redirectToSocialLogin} />
    </>
  );
}

function AuthenticatedNav() {
  return (
    <nav className="flex items-center gap-8" aria-label="메인 메뉴">
      <NavLink to="/walk" className={linkClass}>
        산책
      </NavLink>
      <NavLink to="/community" className={linkClass}>
        커뮤니티
      </NavLink>
      <NavLink to="/my" className={linkClass}>
        마이도도
      </NavLink>
      <ProfileMenu />
    </nav>
  );
}

export function Header() {
  const isLoggedIn = useIsLoggedIn();

  return (
    <header className="relative z-20 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <Link to="/" className="flex shrink-0 items-center py-1" aria-label="DoDo 홈">
          <DoDoLogo className="h-8 w-auto" />
        </Link>
        <div className="ml-auto flex items-center">{isLoggedIn ? <AuthenticatedNav /> : <GuestNav />}</div>
      </div>
    </header>
  );
}
