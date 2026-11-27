import { ModusWcIcon } from '@trimble-oss/moduswebcomponents-react';
import type { CSSProperties } from 'react';

import type { NavIconSource } from '../modules/device-management/nav';

type NavIconProps = {
  icon: NavIconSource;
};

function maskUrl(icon: Extract<NavIconSource, { type: 'svgUrl' | 'svgMarkup' }>): string {
  if (icon.type === 'svgUrl') {
    return `url("${icon.src}")`;
  }

  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(icon.markup)}")`;
}

export function NavIcon({ icon }: NavIconProps) {
  if (icon.type === 'modus') {
    return (
      <ModusWcIcon
        customClass="nav-icon"
        decorative
        name={icon.name}
        size="md"
        slot="start-icon"
      />
    );
  }

  return (
    <span className="nav-custom-icon-slot" slot="start-icon">
      <span
        className="nav-icon nav-custom-icon"
        aria-hidden="true"
        style={{ '--nav-icon-mask': maskUrl(icon) } as CSSProperties}
      />
    </span>
  );
}
