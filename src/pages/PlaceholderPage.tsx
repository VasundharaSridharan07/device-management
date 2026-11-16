import { ModusWcCard, ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';
import { useLocation } from 'react-router-dom';

import { navFromPath } from '../nav';

export function PlaceholderPage() {
  const location = useLocation();
  const item = navFromPath(location.pathname);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
      <ModusWcTypography hierarchy="h1" label={item.label} />
      <ModusWcCard bordered padding="compact">
        <ModusWcTypography
          customClass="app-muted"
          label={`${item.description} This area is a placeholder in the prototype.`}
        />
      </ModusWcCard>
    </div>
  );
}
