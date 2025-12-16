const Joi = require('joi');

/**
 * Schema de validação para criar ordem de serviço
 */
const createServiceOrderSchema = Joi.object({
  client_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID do cliente deve ser um número',
      'number.positive': 'ID do cliente deve ser positivo',
      'any.required': 'Cliente é obrigatório'
    }),

  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'ID da categoria deve ser um número',
      'number.positive': 'ID da categoria deve ser positivo'
    }),

  equipment: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Equipamento deve ter no mínimo 3 caracteres',
      'string.max': 'Equipamento deve ter no máximo 100 caracteres',
      'any.required': 'Equipamento é obrigatório'
    }),

  brand: Joi.string()
    .max(50)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Marca deve ter no máximo 50 caracteres'
    }),

  model: Joi.string()
    .max(50)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Modelo deve ter no máximo 50 caracteres'
    }),

  serial_number: Joi.string()
    .max(50)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Número de série deve ter no máximo 50 caracteres'
    }),

  reported_issue: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Problema relatado deve ter no mínimo 10 caracteres',
      'string.max': 'Problema relatado deve ter no máximo 2000 caracteres',
      'any.required': 'Problema relatado é obrigatório'
    }),

  priority: Joi.string()
    .valid('low', 'normal', 'high', 'urgent')
    .default('normal')
    .messages({
      'any.only': 'Prioridade deve ser: low, normal, high ou urgent'
    }),

  estimated_cost: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .allow(null)
    .messages({
      'number.min': 'Custo estimado não pode ser negativo',
      'number.precision': 'Custo estimado deve ter no máximo 2 casas decimais'
    }),

  estimated_completion: Joi.date()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Data de conclusão estimada inválida'
    }),

  customer_notes: Joi.string()
    .max(1000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Observações do cliente devem ter no máximo 1000 caracteres'
    }),
});

/**
 * Schema de validação para atualizar ordem de serviço
 */
const updateServiceOrderSchema = Joi.object({
  technician_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'ID do técnico deve ser um número',
      'number.positive': 'ID do técnico deve ser positivo'
    }),

  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),

  status: Joi.string()
    .valid('open', 'in_progress', 'waiting_parts', 'waiting_approval', 'completed', 'cancelled', 'delivered')
    .optional()
    .messages({
      'any.only': 'Status inválido'
    }),

  priority: Joi.string()
    .valid('low', 'normal', 'high', 'urgent')
    .optional(),

  equipment: Joi.string()
    .min(3)
    .max(100)
    .optional(),

  brand: Joi.string()
    .max(50)
    .optional()
    .allow('', null),

  model: Joi.string()
    .max(50)
    .optional()
    .allow('', null),

  serial_number: Joi.string()
    .max(50)
    .optional()
    .allow('', null),

  reported_issue: Joi.string()
    .min(10)
    .max(2000)
    .optional(),

  diagnosed_issue: Joi.string()
    .max(2000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Diagnóstico deve ter no máximo 2000 caracteres'
    }),

  solution: Joi.string()
    .max(2000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Solução deve ter no máximo 2000 caracteres'
    }),

  technician_notes: Joi.string()
    .max(1000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Observações do técnico devem ter no máximo 1000 caracteres'
    }),

  customer_notes: Joi.string()
    .max(1000)
    .optional()
    .allow('', null),

  estimated_cost: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .allow(null),

  parts_cost: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .allow(null)
    .messages({
      'number.min': 'Custo de peças não pode ser negativo'
    }),

  labor_cost: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .allow(null)
    .messages({
      'number.min': 'Custo de mão de obra não pode ser negativo'
    }),

  final_cost: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .allow(null)
    .messages({
      'number.min': 'Custo final não pode ser negativo'
    }),

  discount: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .allow(null)
    .messages({
      'number.min': 'Desconto não pode ser negativo'
    }),

  estimated_completion: Joi.date()
    .optional()
    .allow(null),

  warranty_days: Joi.number()
    .integer()
    .min(0)
    .max(3650)
    .optional()
    .messages({
      'number.min': 'Dias de garantia não pode ser negativo',
      'number.max': 'Dias de garantia não pode exceder 10 anos'
    }),

  is_urgent: Joi.boolean()
    .optional(),

  requires_approval: Joi.boolean()
    .optional(),
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

/**
 * Schema de validação para adicionar item à OS
 */
const addOrderItemSchema = Joi.object({
  type: Joi.string()
    .valid('service', 'part', 'other')
    .required()
    .messages({
      'any.only': 'Tipo deve ser: service, part ou other',
      'any.required': 'Tipo é obrigatório'
    }),

  description: Joi.string()
    .min(3)
    .max(500)
    .required()
    .messages({
      'string.min': 'Descrição deve ter no mínimo 3 caracteres',
      'string.max': 'Descrição deve ter no máximo 500 caracteres',
      'any.required': 'Descrição é obrigatória'
    }),

  quantity: Joi.number()
    .min(0.01)
    .precision(2)
    .required()
    .messages({
      'number.min': 'Quantidade deve ser maior que zero',
      'any.required': 'Quantidade é obrigatória'
    }),

  unit_price: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.min': 'Preço unitário não pode ser negativo',
      'any.required': 'Preço unitário é obrigatório'
    }),

  discount: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .default(0)
    .messages({
      'number.min': 'Desconto não pode ser negativo'
    }),

  notes: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Observações devem ter no máximo 500 caracteres'
    }),
});

/**
 * Schema de validação para filtros de busca
 */
const searchFiltersSchema = Joi.object({
  status: Joi.string()
    .valid('open', 'in_progress', 'waiting_parts', 'waiting_approval', 'completed', 'cancelled', 'delivered')
    .optional(),

  priority: Joi.string()
    .valid('low', 'normal', 'high', 'urgent')
    .optional(),

  client_id: Joi.number()
    .integer()
    .positive()
    .optional(),

  technician_id: Joi.number()
    .integer()
    .positive()
    .optional(),

  category_id: Joi.number()
    .integer()
    .positive()
    .optional(),

  date_from: Joi.date()
    .optional(),

  date_to: Joi.date()
    .optional()
    .when('date_from', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('date_from')).messages({
        'date.min': 'Data final deve ser posterior à data inicial'
      })
    }),

  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Busca deve ter no máximo 100 caracteres'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional(),

  sort_by: Joi.string()
    .valid('created_at', 'updated_at', 'number', 'status', 'priority')
    .default('created_at')
    .optional(),

  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .optional(),
});

/**
 * Middleware de validação
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Erro de validação',
          validationErrors: errors,
        },
      });
    }

    req.validatedData = value;
    next();
  };
};

/**
 * Middleware de validação para query params
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Erro de validação nos parâmetros',
          validationErrors: errors,
        },
      });
    }

    req.validatedQuery = value;
    next();
  };
};

module.exports = {
  createServiceOrderSchema,
  updateServiceOrderSchema,
  addOrderItemSchema,
  searchFiltersSchema,
  validate,
  validateQuery,
};
