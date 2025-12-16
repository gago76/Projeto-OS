import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ServiceOrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  
  // REMOVIDO: const API_URL = 'http://localhost:3001/api';

  const [formData, setFormData] = useState({
    client_id: '',
    equipment: '',
    brand: '',
    model: '',
    serial_number: '',
    reported_issue: '',
    priority: 'normal',
    status: 'open',
    price: '', 
    customer_notes: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchClients();
      if (id) {
        fetchServiceOrder();
      }
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      // CORREÇÃO: Usando a URL relativa /api
      const response = await fetch(`/api/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClients(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar lista de clientes');
    }
  };

  const fetchServiceOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      // CORREÇÃO: Usando a URL relativa /api
      const response = await fetch(`/api/service-orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          client_id: data.client_id || '',
          equipment: data.equipment || '',
          brand: data.brand || '',
          model: data.model || '',
          serial_number: data.serial_number || '',
          reported_issue: data.reported_issue || '',
          priority: data.priority || 'normal',
          status: data.status || 'open',
          price: data.price !== undefined && data.price !== null ? data.price : '', 
          customer_notes: data.customer_notes || ''
        });
      } else {
        toast.error('Não foi possível carregar os dados da OS');
      }
    } catch (error) {
      console.error('Erro ao buscar OS:', error);
      toast.error('Erro de conexão ao buscar OS');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const loadingToast = toast.loading('Salvando Ordem de Serviço...');

    try {
      const token = localStorage.getItem('token');
      // CORREÇÃO: Usando a URL relativa /api
      const url = id 
        ? `/api/service-orders/${id}`
        : `/api/service-orders`;
      
      const method = id ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        // CORREÇÃO DE SEGURANÇA: Garante que seja número ou 0, evitando NaN
        price: formData.price ? (parseFloat(formData.price) || 0) : 0
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success(id ? 'OS atualizada com sucesso!' : 'OS criada com sucesso!');
        
        if (id) {
          fetchServiceOrder(); 
        } else {
          navigate('/orders'); 
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar OS');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Erro:', error);
      toast.error('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- CORREÇÃO PRINCIPAL AQUI ---
  // Substituído .toString() por String() para evitar erro fatal se vier null/undefined
  const selectedClientData = clients.find(c => String(c?.id) === String(formData.client_id));
  const clientName = selectedClientData?.name || 'Cliente não identificado';
  const clientPhone = selectedClientData?.phone || '';
  // -------------------------------

  const formatCurrency = (value) => {
    if (value === '' || value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ================= TELA DE EDIÇÃO ================= */}
      <div className="py-8 max-w-4xl mx-auto px-4 print:hidden">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center text-gray-600 hover:text-blue-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Lista
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {id ? `Editar OS #${id}` : 'Nova Ordem de Serviço'}
            </h1>
          </div>
          
          <div className="flex gap-3">
            {id && (
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Informações do Cliente</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Selecione um cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Status e Valor</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Atual</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md font-medium
                    ${formData.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                    ${formData.status === 'open' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : ''}
                  `}
                >
                  <option value="open">Aberta</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="waiting_approval">Aguardando Aprovação</option>
                  <option value="completed">✅ Concluída</option>
                  <option value="cancelled">❌ Cancelada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Valor Total (R$)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="block w-full rounded-md border-gray-300 pl-10 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 font-bold text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Equipamento</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Equipamento *</label>
              <input
                type="text"
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                required
                placeholder="Ex: Notebook Dell Inspiron"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número de Série</label>
              <input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          <div className="mb-6">
             <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Detalhes do Serviço</h2>
             <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Defeito Relatado / Serviço Realizado *</label>
              <textarea
                name="reported_issue"
                value={formData.reported_issue}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
             </div>
             
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observações Internas / Cliente</label>
              <textarea
                name="customer_notes"
                value={formData.customer_notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
             </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center px-6 py-2 text-white rounded-md transition-colors shadow-sm disabled:bg-gray-400
                ${formData.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Ordem de Serviço'}
            </button>
          </div>
        </form>
      </div>

      {/* ================= LAYOUT DE IMPRESSÃO (Aparece no PDF) ================= */}
      <div className="hidden print:block bg-white p-8 text-black h-screen">
        
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
          <div className="flex items-center gap-4">
             <div>
               <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-900">Ordem de Serviço</h1>
               <p className="text-gray-600 font-bold text-xl mt-1">#{id ? String(id).padStart(4, '0') : 'NOVA'}</p>
             </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">Assistência Técnica</h2>
            <p className="text-sm text-gray-600 mt-1">Seu Endereço Aqui</p>
            <p className="text-sm text-gray-600">Tel: (00) 0000-0000</p>
            <p className="text-sm text-gray-600 mt-2 font-medium">Data: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dados do Cliente</h3>
            <p className="text-xl font-bold text-gray-900">{clientName}</p>
            <p className="text-gray-700 mt-1">{clientPhone || 'Telefone não informado'}</p>
          </div>
          
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Situação</h3>
             <div className="flex justify-between items-center">
                <div>
                   <p className="text-lg font-bold uppercase text-gray-800">
                     {formData.status === 'open' ? 'Aberta' : 
                      formData.status === 'in_progress' ? 'Em Andamento' : 
                      formData.status === 'completed' ? 'Concluída' : formData.status}
                   </p>
                   <p className="text-sm text-gray-600">Prioridade: {formData.priority}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="mb-8 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
            <h3 className="font-bold text-gray-800 uppercase text-sm">Equipamento</h3>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            <div>
              <span className="block text-xs text-gray-500 uppercase">Equipamento</span>
              <span className="font-bold text-gray-900 block mt-1">{formData.equipment}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 uppercase">Marca / Modelo</span>
              <span className="font-bold text-gray-900 block mt-1">{formData.brand} {formData.model}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 uppercase">Nº de Série</span>
              <span className="font-bold text-gray-900 block mt-1">{formData.serial_number || '-'}</span>
            </div>
          </div>
        </div>

        <div className="mb-8 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
            <h3 className="font-bold text-gray-800 uppercase text-sm">Relatório Técnico / Defeito</h3>
          </div>
          <div className="p-4 min-h-[120px]">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{formData.reported_issue}</p>
          </div>
        </div>

        {formData.customer_notes && (
          <div className="mb-8 border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="font-bold text-gray-800 uppercase text-sm">Observações</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-800">{formData.customer_notes}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4 mb-12">
          <div className="w-5/12 border-2 border-gray-800 rounded-lg p-4 bg-gray-50 text-right">
             <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Valor Total do Serviço</span>
             <span className="block text-3xl font-extrabold text-gray-900">
               {formatCurrency(formData.price)}
             </span>
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] text-justify text-gray-500 mb-12 leading-tight">
            Autorizo a execução dos serviços acima descritos. Declaro estar ciente que a garantia dos serviços prestados é de 90 dias, conforme lei vigente. Equipamentos não retirados no prazo de 90 dias após a comunicação de conclusão estarão sujeitos a cobrança de taxa de armazenamento ou descarte.
          </p>
          
          <div className="grid grid-cols-2 gap-16">
            <div className="text-center">
              <div className="border-t border-black w-full pt-2"></div>
              <p className="text-sm font-bold uppercase">Técnico Responsável</p>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-full pt-2"></div>
              <p className="text-sm font-bold uppercase">Assinatura do Cliente</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServiceOrderForm;