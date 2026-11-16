import {
  ModusWcNavbar,
  ModusWcThemeSwitcher,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

const USER_CARD = {
  avatarAlt: 'Alex Rivera',
  email: 'alex.rivera@trimble.com',
  name: 'Alex Rivera',
};

type AppNavbarProps = {
  isWide: boolean;
  onToggleNav: () => void;
};

export function AppNavbar({ isWide, onToggleNav }: AppNavbarProps) {
  return (
    <ModusWcNavbar
      customClass="app-shell-navbar sticky top-0 z-[120]"
      logoName="trimble"
      mainMenuOpen={false}
      userCard={USER_CARD}
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
      <div slot="end" className="flex items-center">
        <ModusWcThemeSwitcher aria-label="Theme" />
      </div>
    </ModusWcNavbar>
  );
}
