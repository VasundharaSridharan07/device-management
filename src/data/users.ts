import type { ProductId } from '../products';

export type ProductPermission = {
  productId: ProductId;
  role: string;
};

/** Account person. The same people are the prototype personas. */
export type AccountUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  permissions: ProductPermission[];
};

export const ACCOUNT_USERS: readonly AccountUser[] = [
  {
    id: 'a8Km3pQ1xR7',
    email: 'alex.rivera@trimble.com',
    firstName: 'Alex',
    lastName: 'Rivera',
    permissions: [
      { productId: 'worksmanager', role: 'Licensed Admin' },
      { productId: 'device-management', role: 'Licensed Admin' },
      { productId: 'connect', role: 'Licensed Admin' },
      { productId: 'admin-portal', role: 'Licensed Admin' },
    ],
  },
  {
    id: 'j4Ln9cW2bH6',
    email: 'jordan.lee@trimble.com',
    firstName: 'Jordan',
    lastName: 'Lee',
    permissions: [
      { productId: 'device-management', role: 'Product User' },
      { productId: 'connect', role: 'Product User' },
    ],
  },
];
