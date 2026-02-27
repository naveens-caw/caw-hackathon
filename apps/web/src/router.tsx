import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './routes/home-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);