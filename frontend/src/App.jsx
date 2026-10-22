import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Suppliers from './pages/Suppliers';
import Warehouses from './pages/Warehouses';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="stock-in" element={<StockIn />} />
              <Route path="stock-out" element={<StockOut />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="warehouses" element={<Warehouses />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Catch-all route to redirect unknown or nested paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
