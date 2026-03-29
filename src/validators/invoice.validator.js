const Joi = require('joi');

const createInvoiceSchema = Joi.object({
  client: Joi.string().hex().length(24).required(), 
  amount:   Joi.number().positive().required(),
  amountPaid:   Joi.number().min(0).required(),
  dueDate:  Joi.date().greater('now').required(),      
  description:     Joi.string().max(300).required(),
  status :  Joi.string().valid('pending', 'partial', 'paid','overdue').required(),
});

module.exports = {createInvoiceSchema}