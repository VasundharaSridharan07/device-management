import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useExperiment } from '../../experiments/ExperimentContext';
import { useViewportWidth } from '../../hooks/useViewportWidth';
import { navFromPath, visibleNavItems } from '../../nav';
import { PUSH_LAYOUT_MIN_PX } from '../../theme/shell';
import { AppNavbar } from './AppNavbar';
import { AppSideNav } from './AppSideNav';

export function AppShell() {
  const width = useViewportWidth();
  const isPush = width >= PUSH_LAYOUT_MIN_PX;
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useExperiment();
  const current = navFromPath(location.pathname);
  const isMap = location.pathname === '/';
  const [expanded, setExpanded] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= PUSH_LAYOUT_MIN_PX,
  );

  useEffect(() => {
    setExpanded(isPush);
  }, [isPush]);

  useEffect(() => {
    if (!isPush) {
      setExpanded(false);
    }
  }, [isPush, location.pathname]);

  useEffect(() => {
    const items = visibleNavItems(config.sideNav);
    if (items.some((item) => item.value === current.value) || !items[0]) {
      return;
    }

    navigate(items[0].path, { replace: true });
  }, [config.sideNav, current.value, navigate]);

  const handleToggleNav = useCallback(() => {
    setExpanded((currentExpanded) => !currentExpanded);
  }, []);

  return (
    <div className="app-shell">
      <AppNavbar isWide={isPush} onToggleNav={handleToggleNav} />
      <div className="app-shell-body">
        <AppSideNav
          expanded={expanded}
          isPush={isPush}
          selected={current.value}
          onExpandedChange={setExpanded}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className={
            isMap
              ? 'map-main outline-none'
              : 'flex flex-col gap-3 px-4 py-4 outline-none lg:px-6'
          }
          onClick={() => {
            if (!isPush && expanded) {
              setExpanded(false);
            }
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
