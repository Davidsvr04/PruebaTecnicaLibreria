const Joi = require('joi');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.context?.key,
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors
      });
    }

    req[source] = value;
    next();
  };
};

//Validar cuerpo de la petición
const validateBody = (schema) => validate(schema, 'body');

//Validar parámetros de consulta
const validateQuery = (schema) => validate(schema, 'query');

//Validar parámetros de ruta
const validateParams = (schema) => validate(schema, 'params');

//Validar ID de MongoDB
const validateMongoId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    next();
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  validateMongoId
};