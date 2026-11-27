import { ModusWcCard, ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';

import { usePageTitle } from '../../hooks/usePageTitle';

type ProductPlaceholderProps = {
  appName: string;
  title: string;
  message: string;
};

export function ProductPlaceholder({ appName, title, message }: ProductPlaceholderProps) {
  usePageTitle(title, appName);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
      <ModusWcTypography hierarchy="h1" label={title} />
      <ModusWcCard bordered padding="compact">
        <ModusWcTypography customClass="app-muted" label={message} />
      </ModusWcCard>
    </div>
  );
}
