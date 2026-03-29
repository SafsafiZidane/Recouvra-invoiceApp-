const Joi = require('joi');

const createClientSchema = Joi.object({
  name:    Joi.string().min(2).max(100).required(),
  email:   Joi.string().email().required(),
  phone:   Joi.string().pattern(/^[0-9+\s\-]{7,15}$/).required(),
  address: Joi.string().max(200).required(),
  company : Joi.string().max(200).required(),
  notes :  Joi.string().max(200).required(),
});

const updateClientSchema = Joi.object({
  name:    Joi.string().min(2).max(100),
  email:   Joi.string().email(),
  phone:   Joi.string().pattern(/^[0-9+\s\-]{7,15}$/),
  address: Joi.string().max(200),
}).min(1); 


module.exports = {createClientSchema, updateClientSchema};