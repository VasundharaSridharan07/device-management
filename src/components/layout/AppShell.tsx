import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useExperiment } from '../../experiments/ExperimentContext';
import { useViewportWidth } from '../../hooks/useViewportWidth';
import { navFromPath, PRIMARY_NAV, visibleNavItems } from '../../modules/device-management/nav';
import { DM_MAP_PATH } from '../../modules/device-management/paths';
import { PRODUCTS, productFromPath, selectedProductNav } from '../../products';
import { AppSideNav, type SideNavItem } from './AppSideNav';
import { PUSH_LAYOUT_MIN_PX } from '../../theme/shell';
import { AppNavbar } from './AppNavbar';

export function AppShell() {
  const width = useViewportWidth();
  const isPush = width >= PUSH_LAYOUT_MIN_PX;
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useExperiment();
  const product = productFromPath(location.pathname);
  const current = navFromPath(location.pathname);
  const isDeviceManagement = product.id === 'device-management';
  const selected = isDeviceManagement
    ? current.value
    : selectedProductNav(product, location.pathname);
  const isMap = location.pathname === DM_MAP_PATH || location.pathname === '/';
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
    if (!location.pathname.startsWith(DM_MAP_PATH)) {
      return;
    }

    const items = visibleNavItems(config.sideNav);
    if (items.some((item) => item.value === current.value) || !items[0]) {
      return;
    }

    navigate(items[0].path, { replace: true });
  }, [config.sideNav, current.value, location.pathname, navigate]);

  const handleToggleNav = useCallback(() => {
    setExpanded((currentExpanded) => !currentExpanded);
  }, []);

  const railItems = useMemo<SideNavItem[]>(() => {
    const deviceItems = PRIMARY_NAV.map((item) => ({
      ...item,
      productId: 'device-management',
    }));
    const otherItems = PRODUCTS.flatMap((entry) =>
      entry.id === 'device-management'
        ? []
        : entry.nav.map((item) => ({ ...item, productId: entry.id })),
    );
    return [...deviceItems, ...otherItems];
  }, []);
  const visibleValues = new Set<string>(config.sideNav);

  return (
    <div className="app-shell">
      <AppNavbar isWide={isPush} productLabel={product.label} onToggleNav={handleToggleNav} />
      <div className="app-shell-body">
        <AppSideNav
          expanded={expanded}
          isPush={isPush}
          activeProductId={product.id}
          items={railItems}
          menuLabel={product.label}
          selected={selected}
          visibleValues={visibleValues}
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
