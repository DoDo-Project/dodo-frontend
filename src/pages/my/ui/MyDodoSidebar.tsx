import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  MY_DODO_MENU_ITEMS,
  MY_DODO_SECTION_LABELS,
  getMyDodoMenuHref,
  type MyDodoMenuKey,
  type MyDodoMenuSection,
} from '@/pages/my/model/menu';
import { LogoutConfirmDialog } from '@/pages/my/ui/LogoutConfirmDialog';

interface MyDodoSidebarProps {
  activeKey: MyDodoMenuKey;
  /** 링크 클릭 시 호출 (모바일 햄버거 메뉴를 닫는 용도) */
  onNavigate?: () => void;
}

function menuItemClass(active: boolean) {
  return [
    'block w-full rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-all',
    active
      ? 'border-brand bg-white text-brand ring-1 ring-brand shadow-[0_8px_18px_rgba(217,123,58,0.12)]'
      : 'border-transparent bg-neutral-100/90 text-neutral-700 hover:border-brand/30 hover:bg-white hover:text-brand',
  ].join(' ');
}

function SidebarSection({
  section,
  activeKey,
  onLogout,
  onNavigate,
}: {
  section: MyDodoMenuSection;
  activeKey: MyDodoMenuKey;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const items = MY_DODO_MENU_ITEMS.filter((item) => item.section === section);

  return (
    <section>
      <h3 className="text-lg font-semibold text-neutral-900">{MY_DODO_SECTION_LABELS[section]}</h3>
      <div className="mt-4 flex flex-col gap-3">
        {items.map((item) =>
          item.type === 'action' ? (
            <button key={item.key} type="button" onClick={onLogout} className={menuItemClass(false)}>
              {item.label}
            </button>
          ) : (
            <Link
              key={item.key}
              to={getMyDodoMenuHref(item.key)}
              onClick={onNavigate}
              className={menuItemClass(item.key === activeKey)}
            >
              {item.label}
            </Link>
          ),
        )}
      </div>
    </section>
  );
}

export function MyDodoSidebar({ activeKey, onNavigate }: MyDodoSidebarProps) {
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div className="mt-6 border-t border-neutral-200/80 pt-6">
      <div className="flex flex-col gap-8">
        <SidebarSection
          section="pet"
          activeKey={activeKey}
          onLogout={() => setLogoutOpen(true)}
          onNavigate={onNavigate}
        />
        <SidebarSection
          section="account"
          activeKey={activeKey}
          onLogout={() => setLogoutOpen(true)}
          onNavigate={onNavigate}
        />
      </div>

      <LogoutConfirmDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </div>
  );
}
