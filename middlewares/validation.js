const Joi = require('joi');

const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    subscription: Joi.string().valid("starter", "pro", "business")
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

const validateSubscription = (req, res, next) => {
  const schema = Joi.object({
    subscription: Joi.string().valid("starter", "pro", "business").required(),
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateSubscription
};