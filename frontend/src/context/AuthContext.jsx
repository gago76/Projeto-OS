import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// 1. CORREÇÃO FINAL DA URL DA API 🪄
// Em produção (Vercel), a URL deve ser '', usando o caminho relativo /api,
// que será roteado pelo vercel.json.
// Em desenvolvimento local, a URL é 'http://localhost:3001'.
const isProduction = import.meta.env.PROD; 
const apiURL = isProduction ? '' : 'http://localhost:3001'; 

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []); 

  const checkAuth = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        setIsChecking(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role
        });
      } catch (decodeError) {
        console.error('Erro ao decodificar token:', decodeError);
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  };

  const login = async (email, password) => {
    try {
      // O endpoint final será "/api/auth/login" em produção, ou "http://localhost:3001/api/auth/login" em dev.
      console.log("Tentando conectar em:", `${apiURL}/api/auth/login`); 

      const response = await fetch(`${apiURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password } )
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Erro ao fazer login' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};