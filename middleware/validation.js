const { body, validationResult } = require('express-validator');

const validateServiceOrder = [
  body('client_id').isInt({ min: 1 }).withMessage('ID do cliente inválido'),
  body('equipment').isLength({ min: 1, max: 100 }).withMessage('Equipamento é obrigatório'),
  body('reported_issue').isLength({ min: 1, max: 1000 }).withMessage('Problema relatado é obrigatório'),
  body('estimated_cost').isFloat({ min: 0 }).optional().withMessage('Custo estimado deve ser um número positivo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    }
  }
  next();
};

module.exports = { validateServiceOrder, sanitizeInput };