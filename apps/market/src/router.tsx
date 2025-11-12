import { createHashRouter, Navigate } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Item from './pages/Item';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'item/:id', element: <Item /> },
      { path: 'orders', element: <Orders /> },
      { path: 'profile', element: <Profile /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
