import type { ProductId } from '../products';

import { ACCOUNT_NAME } from './projects';

export type SubscriptionStatus = 'active' | 'expired';

export type Subscription = {
  id: string;
  accountName: string;
  productId: ProductId;
  plan: string;
  status: SubscriptionStatus;
};

export const SUBSCRIPTIONS: readonly Subscription[] = [
  {
    id: 's3Wm8kP2nQ5',
    accountName: ACCOUNT_NAME,
    productId: 'worksmanager',
    plan: 'WorksManager',
    status: 'active',
  },
  {
    id: 's6Dm1rT9vL4',
    accountName: ACCOUNT_NAME,
    productId: 'device-management',
    plan: 'Device Management',
    status: 'active',
  },
  {
    id: 's2Tc7hB4mK8',
    accountName: ACCOUNT_NAME,
    productId: 'connect',
    plan: 'Trimble Connect',
    status: 'active',
  },
  {
    id: 's9Ap5cN3wJ1',
    accountName: ACCOUNT_NAME,
    productId: 'admin-portal',
    plan: 'Admin Portal',
    status: 'active',
  },
];
