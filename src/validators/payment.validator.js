const Joi = require('joi');

const createPaymentSchema = Joi.object({
  invoice: Joi.string().hex().length(24).required(),
  amount:    Joi.number().positive().required(),
  method:    Joi.string().valid('cash', 'transfer', 'check').required(),
  note:      Joi.string().max(300).optional(),
  date:      Joi.date().required(),
});

module.exports = {createPaymentSchema};