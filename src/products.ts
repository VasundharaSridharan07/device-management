import type { NavIconSource } from './modules/device-management/nav';

export type ProductId = 'worksmanager' | 'device-management' | 'connect' | 'admin-portal';

export type ProductNavItem = {
  path: string;
  value: string;
  label: string;
  icon: NavIconSource;
  description: string;
};

export type ProductDefinition = {
  id: ProductId;
  label: string;
  pathPrefix: string;
  homePath: string;
  nav: ProductNavItem[];
};

export const PRODUCTS: readonly ProductDefinition[] = [
  {
    id: 'worksmanager',
    label: 'WorksManager',
    pathPrefix: '/worksmanager',
    homePath: '/worksmanager/projects',
    nav: [
      {
        path: '/worksmanager/projects',
        value: 'projects',
        label: 'Projects',
        icon: { type: 'modus', name: 'folder_project' },
        description: 'WorksManager projects will appear here.',
      },
    ],
  },
  {
    id: 'device-management',
    label: 'Device Management',
    pathPrefix: '/device-management',
    homePath: '/device-management',
    // The Device Management rail is PRIMARY_NAV, including the experiment filter.
    nav: [],
  },
  {
    id: 'connect',
    label: 'Trimble Connect',
    pathPrefix: '/connect',
    homePath: '/connect/projects',
    nav: [
      {
        path: '/connect/projects',
        value: 'projects',
        label: 'Projects',
        icon: { type: 'modus', name: 'folder_project' },
        description: 'Trimble Connect projects will appear here.',
      },
    ],
  },
  {
    id: 'admin-portal',
    label: 'Admin Portal',
    pathPrefix: '/admin-portal',
    homePath: '/admin-portal/account/users',
    nav: [
      {
        path: '/admin-portal/account/users',
        value: 'users',
        label: 'Users',
        icon: { type: 'modus', name: 'people_group' },
        description: 'Account users will appear here.',
      },
    ],
  },
];

export function productById(id: ProductId): ProductDefinition {
  const match = PRODUCTS.find((product) => product.id === id);
  if (match) {
    return match;
  }

  const fallback = PRODUCTS.find((product) => product.id === 'device-management');
  if (!fallback) {
    throw new Error('Device Management is not registered');
  }

  return fallback;
}

/** Device Management remains the fallback so legacy URLs keep the same shell. */
export function productFromPath(pathname: string): ProductDefinition {
  const match = PRODUCTS.find(
    (product) => pathname === product.pathPrefix || pathname.startsWith(`${product.pathPrefix}/`),
  );
  return match ?? productById('device-management');
}

export function selectedProductNav(product: ProductDefinition, pathname: string): string {
  const match = product.nav.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  );
  if (match) {
    return match.value;
  }

  if (product.id === 'connect' && pathname.startsWith('/connect/')) {
    return 'projects';
  }

  return product.nav[0]?.value ?? '';
}
