import {
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcSideNavigation,
} from '@trimble-oss/moduswebcomponents-react';
import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NavIconSource } from '../../modules/device-management/nav';
import { SIDE_NAV_MAX_WIDTH, SIDE_NAV_MIN_WIDTH } from '../../theme/shell';
import { NavIcon } from '../NavIcon';

export type SideNavItem = {
  path: string;
  value: string;
  label: string;
  icon: NavIconSource;
  productId: string;
};

type AppSideNavProps = {
  isPush: boolean;
  expanded: boolean;
  selected: string;
  activeProductId: string;
  menuLabel: string;
  items: readonly SideNavItem[];
  /** Device Management items outside this set stay mounted and are hidden. */
  visibleValues?: ReadonlySet<string>;
  onExpandedChange: (expanded: boolean) => void;
};

export function AppSideNav({
  isPush,
  expanded,
  selected,
  activeProductId,
  menuLabel,
  items,
  visibleValues,
  onExpandedChange,
}: AppSideNavProps) {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) {
      return;
    }

    const margin = expanded ? SIDE_NAV_MAX_WIDTH : SIDE_NAV_MIN_WIDTH;
    main.style.marginLeft = margin;

    let first = 0;
    let second = 0;
    first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        main.style.marginLeft = margin;
      });
    });

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [expanded]);

  const handleSelect = (item: SideNavItem) => {
    navigate(item.path);
    if (!isPush) {
      onExpandedChange(false);
    }
  };

  return (
    <aside
      className="app-rail"
      data-expanded={expanded ? 'true' : 'false'}
      data-mode="push"
    >
      <ModusWcSideNavigation
        collapseOnClickOutside={false}
        customClass="app-side-nav"
        expanded={expanded}
        maxWidth={SIDE_NAV_MAX_WIDTH}
        mode="push"
        targetContent="#main-content"
        onExpandedChange={(event) => onExpandedChange(Boolean(event.detail))}
      >
        <div className="app-side-nav-inner">
          <ModusWcMenu aria-label={menuLabel} size="md">
            {items.map((item) => {
              const inProduct = item.productId === activeProductId;
              const allowed =
                item.productId !== 'device-management' ||
                !visibleValues ||
                visibleValues.has(item.value);
              const shown = inProduct && allowed;
              return (
                <ModusWcMenuItem
                  key={item.path}
                  aria-hidden={shown ? undefined : true}
                  customClass={shown ? undefined : 'app-side-nav-item-hidden'}
                  label={item.label}
                  selected={shown && selected === item.value}
                  size="md"
                  value={item.value}
                  onItemSelect={(event) => {
                    if (!shown) {
                      return;
                    }
                    const value = event.detail?.value;
                    if (value === item.value) {
                      handleSelect(item);
                    }
                  }}
                >
                  <NavIcon icon={item.icon} />
                </ModusWcMenuItem>
              );
            })}
          </ModusWcMenu>
        </div>
      </ModusWcSideNavigation>
    </aside>
  );
}
