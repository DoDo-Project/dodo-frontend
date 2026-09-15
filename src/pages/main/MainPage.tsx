import { useIsLoggedIn } from '@/widgets/header/model/useIsLoggedIn';

import { GuestHome } from './ui/GuestHome';
import { LoggedInHome } from './ui/LoggedInHome';

export function MainPage() {
  const isLoggedIn = useIsLoggedIn();

  if (isLoggedIn) {
    return <LoggedInHome />;
  }

  return <GuestHome />;
}
