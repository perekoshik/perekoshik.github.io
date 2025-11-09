import { createHashRouter, Navigate } from 'react-router-dom';
import App from './App';
import { EntryGate } from './routes/EntryGate';
import { CreateShopPage } from './routes/CreateShopPage';
import { ShopOverviewPage } from './routes/ShopOverviewPage';
import { ItemDetailsPage } from './routes/ItemDetailsPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <EntryGate /> },
      { path: 'onboarding', element: <CreateShopPage /> },
      { path: 'shop', element: <ShopOverviewPage /> },
      { path: 'items/:id', element: <ItemDetailsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
