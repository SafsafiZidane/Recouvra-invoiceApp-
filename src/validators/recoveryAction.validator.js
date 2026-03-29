const Joi = require('joi');

const createActionSchema = Joi.object({
  invoice: Joi.string().hex().length(24).required(),
  agent: Joi.string().hex().length(24).required(),
  type:      Joi.string().valid('call', 'email', 'letter', 'visit').required(),
  note:      Joi.string().min(5).max(500).required(),
  outcome:   Joi.string().max(300).optional(),
  date:      Joi.date().max('now').optional(),
  nextActionDate : Joi.date().required(),
});
module.exports = {createActionSchema};