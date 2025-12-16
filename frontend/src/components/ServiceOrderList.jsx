import React, { useState, useEffect } from 'react'; // <--- CORREÇÃO DE SINTAXE AQUI
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, FileText, Edit, Trash2, ArrowLeft, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const ServiceOrderList = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <--- Para ler a URL
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' ou o status específico

  // A API_URL hardcoded foi removida, usando o caminho relativo /api

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]); // Adicionado statusFilter para re-fetch automático ao filtrar

  // Efeito para detectar filtro vindo do Dashboard via URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    if (statusParam && statusParam !== statusFilter) {
      setStatusFilter(statusParam);
    }
  }, [location]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // CORREÇÃO: Usando a URL relativa /api com filtro
      const filterQuery = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/service-orders${filterQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        toast.error('Erro ao carregar ordens de serviço');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta OS?')) return;

    try {
      const token = localStorage.getItem('token');
      // CORREÇÃO: Usando a URL relativa /api
      const response = await fetch(`/api/service-orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('OS excluída com sucesso');
        setOrders(orders.filter(order => order.id !== id));
      } else {
        toast.error('Erro ao excluir OS');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_approval: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: 'Aberta',
      in_progress: 'Em Andamento',
      waiting_approval: 'Aguardando',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  };

  // --- LÓGICA DE FILTRAGEM (Busca + Status) ---
  const filteredOrders = orders.filter(order => {
    // 1. Filtro de Texto
    const matchesSearch = 
      order.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.equipment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toString().includes(searchTerm);

    // 2. Filtro de Status
    // O fetchOrders já pode ter filtrado, mas mantemos isso para refinar a busca local
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-blue-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
            <p className="text-gray-500 mt-1">Gerencie todos os serviços da assistência</p>
          </div>
          
          <Link
            to="/orders/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova OS
          </Link>
        </div>

        {/* Barra de Filtros (Pesquisa + Status) */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4">
          
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente, equipamento ou nº da OS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Seletor de Status */}
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white appearance-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="open">Abertas</option>
              <option value="in_progress">Em Andamento</option>
              <option value="waiting_approval">Aguardando</option>
              <option value="completed">Concluídas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

        </div>

        {/* Lista / Tabela */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        #{String(order.id).padStart(4, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.client?.name || order.client_name || 'Cliente não identificado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{order.equipment}</div>
                        <div className="text-xs">{order.brand} {order.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at || Date.now()).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p>
                        {statusFilter !== 'all' 
                          ? `Nenhuma ordem encontrada com status "${getStatusLabel(statusFilter)}".`
                          : 'Nenhuma ordem de serviço encontrada.'}
                      </p>
                      {statusFilter !== 'all' && (
                        <button 
                          onClick={() => setStatusFilter('all')}
                          className="text-blue-600 hover:underline mt-2 text-sm"
                        >
                          Limpar filtro e mostrar tudo
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderList;