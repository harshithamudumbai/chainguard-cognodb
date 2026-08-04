import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { NetworkExplorer } from './pages/NetworkExplorer';
import { RiskImpact } from './pages/RiskImpact';
import { Compare } from './pages/Compare';
import { Critical } from './pages/Critical';
import { Suppliers } from './pages/Suppliers';
import { SupplierDetail } from './pages/SupplierDetail';
import './index.css';

import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="network" element={<NetworkExplorer />} />
            <Route path="risks" element={<RiskImpact />} />
            <Route path="risks/:riskId" element={<RiskImpact />} />
            <Route path="compare" element={<Compare />} />
            <Route path="critical-dependencies" element={<Critical />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="suppliers/:supplierId" element={<SupplierDetail />} />
            <Route path="products/:productId" element={<NetworkExplorer />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
