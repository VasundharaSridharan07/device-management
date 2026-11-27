import type { LogoName } from '@trimble-oss/moduswebcomponents';
import {
  ModusWcButton,
  ModusWcLogo,
  ModusWcNavbar,
  ModusWcPanel,
  ModusWcThemeSwitcher,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { personaById } from '../../experiments/config';
import { useExperiment } from '../../experiments/ExperimentContext';
import { PRODUCTS, type ProductId } from '../../products';
import { PrototypeConfig } from './PrototypeConfig';

const PRODUCT_EMBLEM: Record<ProductId, LogoName> = {
  'admin-portal': 'trimble',
  connect: 'connect',
  'device-management': 'trimble',
  worksmanager: 'worksmanager',
};

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
      customClass="app-shell-navbar sticky top-0"
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
        <ModusWcPanel
          aria-label="Products"
          floating
          height="auto"
          width="fit-content"
        >
          <div slot="body" className="app-product-grid">
            {PRODUCTS.map((product) => {
              const current = product.label === productLabel;
              return (
                <ModusWcButton
                  key={product.id}
                  aria-current={current ? 'page' : undefined}
                  aria-label={product.label}
                  color="tertiary"
                  size="sm"
                  variant="borderless"
                  onButtonClick={() => {
                    navigate(product.homePath);
                    setAppsMenuOpen(false);
                  }}
                >
                  <span className="app-product-tile">
                    <ModusWcLogo
                      alt=""
                      emblem
                      name={PRODUCT_EMBLEM[product.id]}
                    />
                    <ModusWcTypography size="sm" label={product.label} />
                  </span>
                </ModusWcButton>
              );
            })}
          </div>
        </ModusWcPanel>
      </div>
      <div slot="end" className="flex items-center gap-1">
        <PrototypeConfig />
        <ModusWcThemeSwitcher aria-label="Theme" />
      </div>
    </ModusWcNavbar>
  );
}
