import {
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcNavbar,
  ModusWcThemeSwitcher,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { personaById } from '../../experiments/config';
import { useExperiment } from '../../experiments/ExperimentContext';
import { PRODUCTS } from '../../products';
import { PrototypeConfig } from './PrototypeConfig';

type AppNavbarProps = {
  isWide: boolean;
  productLabel: string;
  onToggleNav: () => void;
};

export function AppNavbar({ isWide, productLabel, onToggleNav }: AppNavbarProps) {
  const navigate = useNavigate();
  const { config } = useExperiment();
  const userCard = personaById(config.persona).user;
  const [appsMenuOpen, setAppsMenuOpen] = useState(false);

  return (
    <ModusWcNavbar
      appsMenuOpen={appsMenuOpen}
      customClass="app-shell-navbar sticky top-0 z-[120]"
      logoName="trimble"
      mainMenuOpen={false}
      userCard={userCard}
      visibility={{
        ai: isWide,
        apps: true,
        help: isWide,
        logo: true,
        mainMenu: true,
        notifications: isWide,
        search: isWide,
        searchInput: false,
        user: true,
      }}
      onAppsMenuOpenChange={(event) => {
        setAppsMenuOpen(Boolean(event.detail));
      }}
      onMainMenuOpenChange={() => {
        onToggleNav();
      }}
    >
      <div slot="start" className="flex min-w-0 items-center">
        <ModusWcTypography size="md" weight="semibold" label={productLabel} />
      </div>
      <div slot="center" hidden />
      <div slot="notifications">
        <ModusWcTypography
          customClass="app-muted"
          label="You have no new notifications."
        />
      </div>
      <div slot="apps">
        <ModusWcMenu aria-label="Products" size="md">
          {PRODUCTS.map((product) => (
            <ModusWcMenuItem
              key={product.id}
              label={product.label}
              selected={product.label === productLabel}
              size="md"
              value={product.id}
              onItemSelect={(event) => {
                if (event.detail?.value !== product.id) {
                  return;
                }
                navigate(product.homePath);
                setAppsMenuOpen(false);
              }}
            />
          ))}
        </ModusWcMenu>
      </div>
      <div slot="end" className="flex items-center gap-1">
        <PrototypeConfig />
        <ModusWcThemeSwitcher aria-label="Theme" />
      </div>
    </ModusWcNavbar>
  );
}
