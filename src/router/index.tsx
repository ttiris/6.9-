import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import CaseListPage from '../pages/CaseListPage';
import DecomposePage from '../pages/DecomposePage';
import AssetListPage from '../pages/AssetListPage';
import AssetDetailPage from '../pages/AssetDetailPage';
import TagGraphPage from '../pages/TagGraphPage';
import BriefGeneratorPage from '../pages/BriefGeneratorPage';
import InspirePage from '../pages/InspirePage';
import DashboardPage from '../pages/DashboardPage';
import ChallengePage from '../pages/ChallengePage';
import GuidePage from '../pages/GuidePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'cases', element: <CaseListPage /> },
      { path: 'cases/:id/decompose', element: <DecomposePage /> },
      { path: 'assets', element: <AssetListPage /> },
      { path: 'assets/:id', element: <AssetDetailPage /> },
      { path: 'graph', element: <TagGraphPage /> },
      { path: 'brief', element: <BriefGeneratorPage /> },
      { path: 'inspire', element: <InspirePage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'challenge', element: <ChallengePage /> },
      { path: 'guide', element: <GuidePage /> },
    ],
  },
]);
