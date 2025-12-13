const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Definir níveis de log customizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir cores para cada nível
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato personalizado para logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Formato para arquivos (sem cores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json(),
);

// Transports
const transports = [
  // Console output
  new winston.transports.Console({
    format,
  }),
  
  // Arquivo de erro
  new DailyRotateFile({
    filename: path.join(__dirname, '../logs/error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  
  // Arquivo combinado
  new DailyRotateFile({
    filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  
  // Arquivo de acesso HTTP
  new DailyRotateFile({
    filename: path.join(__dirname, '../logs/http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '7d',
  }),
];

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports,
  exitOnError: false,
});

// Stream para Morgan
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

// Função auxiliar para log de erros com contexto
logger.logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

// Função auxiliar para log de auditoria
logger.logAudit = (action, userId, details = {}) => {
  logger.info({
    type: 'AUDIT',
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Função auxiliar para log de performance
logger.logPerformance = (operation, duration, details = {}) => {
  logger.info({
    type: 'PERFORMANCE',
    operation,
    duration: `${duration}ms`,
    ...details,
  });
};

module.exports = logger;
