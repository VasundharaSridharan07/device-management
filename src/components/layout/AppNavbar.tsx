import {
  ModusWcNavbar,
  ModusWcThemeSwitcher,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

import { personaById } from '../../experiments/config';
import { useExperiment } from '../../experiments/ExperimentContext';
import { PrototypeConfig } from './PrototypeConfig';

type AppNavbarProps = {
  isWide: boolean;
  onToggleNav: () => void;
};

export function AppNavbar({ isWide, onToggleNav }: AppNavbarProps) {
  const { config } = useExperiment();
  const userCard = personaById(config.persona).user;

  return (
    <ModusWcNavbar
      customClass="app-shell-navbar sticky top-0 z-[120]"
      logoName="trimble"
      mainMenuOpen={false}
      userCard={userCard}
      visibility={{
        ai: isWide,
        apps: isWide,
        help: isWide,
        logo: true,
        mainMenu: true,
        notifications: isWide,
        search: isWide,
        searchInput: false,
        user: true,
      }}
      onMainMenuOpenChange={() => {
        onToggleNav();
      }}
    >
      <div slot="start" className="flex min-w-0 items-center">
        <ModusWcTypography size="md" weight="semibold" label="Device Management" />
      </div>
      <div slot="center" hidden />
      <div slot="notifications">
        <ModusWcTypography
          customClass="app-muted"
          label="You have no new notifications."
        />
      </div>
      <div slot="apps">
        <ModusWcTypography
          customClass="app-muted"
          label="Connected apps will appear here."
        />
      </div>
      <div slot="end" className="flex items-center gap-1">
        <PrototypeConfig />
        <ModusWcThemeSwitcher aria-label="Theme" />
      </div>
    </ModusWcNavbar>
  );
}
