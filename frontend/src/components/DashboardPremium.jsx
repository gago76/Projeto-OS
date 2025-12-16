import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  UserPlus, 
  Users, 
  PlusCircle, 
  Wrench, 
  CheckCircle, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    open: 0,
    inProgress: 0,
    completedMonth: 0,
    revenueMonth: 0
  });

  // REMOVIDO: const API_URL = 'http://localhost:3001/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // CORREÇÃO: Usando a URL relativa /api
      const response = await fetch(`/api/service-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const orders = Array.isArray(data) ? data : [];
        calculateMetrics(orders);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (orders) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let open = 0;
    let inProgress = 0;
    let completedMonth = 0;
    let revenueMonth = 0;

    orders.forEach(order => {
      if (order.status === 'open') open++;
      if (order.status === 'in_progress') inProgress++;

      if (order.status === 'completed') {
        const orderDate = new Date(order.created_at || Date.now());
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          completedMonth++;
          const price = parseFloat(order.price) || 0;
          revenueMonth += price;
        }
      }
    });

    setMetrics({ open, inProgress, completedMonth, revenueMonth });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // --- AÇÃO DO CLIQUE NO CARD ---
  const handleCardClick = (filterStatus) => {
    // Navega para a lista passando o status desejado na URL
    navigate(`/orders?status=${filterStatus}`);
  };

  const stats = [
    { 
      title: 'OS em Aberto', 
      value: loading ? '...' : metrics.open, 
      icon: Clock, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-100',
      filter: 'open' // Filtra por 'Aberta'
    },
    { 
      title: 'Em Andamento', 
      value: loading ? '...' : metrics.inProgress, 
      icon: Wrench, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      filter: 'in_progress' // Filtra por 'Em Andamento'
    },
    { 
      title: 'Concluídas (Mês)', 
      value: loading ? '...' : metrics.completedMonth, 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-100',
      filter: 'completed' // Filtra por 'Concluída'
    },
    { 
      title: 'Faturamento (Mês)', 
      value: loading ? '...' : formatCurrency(metrics.revenueMonth), 
      icon: TrendingUp, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-100',
      filter: 'completed' // Também leva para as concluídas
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel de Controle</h1>
          <p className="text-gray-600 mt-2">Visão geral da sua assistência técnica.</p>
        </div>

        {/* Grid de Estatísticas Clicáveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              onClick={() => handleCardClick(stat.filter)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition-all hover:scale-105 hover:shadow-md cursor-pointer"
            >
              <div className={`p-4 rounded-full ${stat.bg} mr-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ações Rápidas */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <PlusCircle className="w-5 h-5 mr-2 text-blue-600" />
              Acesso Rápido
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/orders/new')}
                className="flex flex-col items-center justify-center p-6 bg-blue-50 border-2 border-blue-100 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all group"
              >
                <div className="bg-blue-600 text-white p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <Wrench className="w-6 h-6" />
                </div>
                <span className="font-bold text-blue-900">Nova Ordem de Serviço</span>
                <span className="text-xs text-blue-600 mt-1">Registrar entrada</span>
              </button>

              <button 
                onClick={() => navigate('/clients/new')}
                className="flex flex-col items-center justify-center p-6 bg-green-50 border-2 border-green-100 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all group"
              >
                <div className="bg-green-600 text-white p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-6 h-6" />
                </div>
                <span className="font-bold text-green-900">Novo Cliente</span>
                <span className="text-xs text-green-600 mt-1">Cadastrar pessoa/empresa</span>
              </button>
            </div>
          </div>

          {/* Navegação */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-gray-600" />
              Gerenciamento
            </h2>
            <div className="space-y-4">
              <div 
                onClick={() => navigate('/orders')}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-gray-100 p-2 rounded-lg mr-4">
                    <ClipboardList className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Minhas Ordens de Serviço</h3>
                    <p className="text-sm text-gray-500">Ver lista completa, editar e imprimir</p>
                  </div>
                </div>
                <div className="text-gray-400">→</div>
              </div>

              <div 
                onClick={() => navigate('/clients')}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-gray-100 p-2 rounded-lg mr-4">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Meus Clientes</h3>
                    <p className="text-sm text-gray-500">Gerenciar base de contatos</p>
                  </div>
                </div>
                <div className="text-gray-400">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;