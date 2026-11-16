import {
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcSideNavigation,
} from '@trimble-oss/moduswebcomponents-react';
import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { PRIMARY_NAV, type NavItem } from '../../nav';
import { SIDE_NAV_MAX_WIDTH, SIDE_NAV_MIN_WIDTH } from '../../theme/shell';
import { NavIcon } from '../NavIcon';

type AppSideNavProps = {
  isPush: boolean;
  expanded: boolean;
  selected: string;
  onExpandedChange: (expanded: boolean) => void;
};

export function AppSideNav({
  isPush,
  expanded,
  selected,
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

  const handleSelect = (item: NavItem) => {
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
          <ModusWcMenu aria-label="Device Management" size="md">
            {PRIMARY_NAV.map((item) => (
              <ModusWcMenuItem
                key={item.value}
                label={item.label}
                selected={selected === item.value}
                size="md"
                value={item.value}
                onItemSelect={(event) => {
                  const value = event.detail?.value;
                  if (value === item.value) {
                    handleSelect(item);
                  }
                }}
              >
                <NavIcon icon={item.icon} />
              </ModusWcMenuItem>
            ))}
          </ModusWcMenu>
        </div>
      </ModusWcSideNavigation>
    </aside>
  );
}
