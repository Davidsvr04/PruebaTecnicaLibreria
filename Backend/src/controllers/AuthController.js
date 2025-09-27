const AuthService = require('../services/AuthService');
const { MESSAGES, ERROR_CODES } = require('../config/constants');

class AuthController {
  //Registrar nuevo usuario
  static async register(req, res, next) {
    try {
      const result = await AuthService.registerUser(req.body);

      res.status(201).json({
        success: true,
        message: MESSAGES.SUCCESS.USER_REGISTERED,
        data: result
      });
    } catch (error) {
      if (error.code === 'USER_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.DUPLICATE_ERROR,
          field: error.field
        });
      }

      next(error);
    }
  }

  //Iniciar sesión
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginUser(email, password);

      res.status(200).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        data: result
      });
    } catch (error) {
      if (error.code === ERROR_CODES.AUTHENTICATION_ERROR) {
        return res.status(401).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.AUTHENTICATION_ERROR
        });
      }

      next(error);
    }
  }
}

module.exports = AuthController;