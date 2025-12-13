import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/DashboardPremium';

// --- CORREÇÃO AQUI ---
// Antes estava importando de ...List. Agora aponta para ...Form corretamente
import ServiceOrderForm from './components/ServiceOrderForm'; 
import ServiceOrderList from './components/ServiceOrderList'; 
// ---------------------

import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';
import Login from './components/Login';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const token = localStorage.getItem('token');
  if (user || token) return children;

  return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          success: { style: { background: '#10B981', color: 'white' } },
          error: { style: { background: '#EF4444', color: 'white' } },
          loading: { style: { background: '#3B82F6', color: 'white' } },
        }}
      />
      
      {/* Removemos as flags 'future' para simplificar, a menos que você precise delas */}
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Rota da LISTA */}
            <Route path="/orders" element={<ProtectedRoute><ServiceOrderList /></ProtectedRoute>} />
            
            {/* Rota do FORMULÁRIO (Nova e Edição) */}
            <Route path="/orders/new" element={<ProtectedRoute><ServiceOrderForm /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><ServiceOrderForm /></ProtectedRoute>} />
            
            <Route path="/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
            <Route path="/clients/new" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;