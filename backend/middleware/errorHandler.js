const logger = require('../config/logger');

/**
 * Classe de erro personalizada para erros de aplicação
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Classe para erros de validação
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

/**
 * Classe para erros de autenticação
 */
class AuthenticationError extends AppError {
  constructor(message = 'Não autenticado') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Classe para erros de autorização
 */
class AuthorizationError extends AppError {
  constructor(message = 'Sem permissão') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Classe para erros de recurso não encontrado
 */
class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Classe para erros de conflito
 */
class ConflictError extends AppError {
  constructor(message = 'Conflito de dados') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Middleware para capturar erros assíncronos
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para tratar erros de validação do express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    
    throw new ValidationError('Erro de validação', formattedErrors);
  }
  
  next();
};

/**
 * Middleware principal de tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log do erro
  logger.logError(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Erro de validação do Joi
  if (err.name === 'ValidationError' && err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    error = new ValidationError(message);
  }

  // Erro de cast do PostgreSQL
  if (err.code === '22P02') {
    error = new ValidationError('Formato de dados inválido');
  }

  // Erro de violação de chave única
  if (err.code === '23505') {
    const field = err.detail?.match(/\(([^)]+)\)/)?.[1] || 'campo';
    error = new ConflictError(`${field} já está em uso`);
  }

  // Erro de violação de chave estrangeira
  if (err.code === '23503') {
    error = new ValidationError('Referência inválida a registro relacionado');
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Token inválido');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expirado');
  }

  // Erro de multer (upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ValidationError('Arquivo muito grande');
    } else {
      error = new ValidationError('Erro no upload do arquivo');
    }
  }

  // Preparar resposta
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    error: {
      message: error.message || 'Erro interno do servidor',
      timestamp: error.timestamp || new Date().toISOString(),
    }
  };

  // Adicionar detalhes em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
    response.error.details = error.errors || undefined;
  }

  // Adicionar erros de validação
  if (error.errors) {
    response.error.validationErrors = error.errors;
  }

  // Enviar resposta
  res.status(statusCode).json(response);
};

/**
 * Middleware para rotas não encontradas
 */
const notFound = (req, res, next) => {
  const error = new NotFoundError(`Rota não encontrada: ${req.originalUrl}`);
  next(error);
};

/**
 * Middleware para log de requisições
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  asyncHandler,
  handleValidationErrors,
  errorHandler,
  notFound,
  requestLogger,
};
