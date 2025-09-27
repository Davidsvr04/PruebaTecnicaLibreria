const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT, MESSAGES, ERROR_CODES } = require('../config/constants');

class AuthService {
  //Generar token JWT
  static generateToken(payload) {
    return jwt.sign(payload, JWT.SECRET, {
      expiresIn: JWT.EXPIRE,
      algorithm: JWT.ALGORITHM
    });
  }

  //Verificar y decodificar token JWT
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT.SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_TOKEN');
      }
      throw new Error('TOKEN_ERROR');
    }
  }

  //Registrar nuevo usuario
  static async registerUser(userData) {
    const { username, email, password } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      const error = new Error(`El ${field} ya está en uso`);
      error.code = 'USER_ALREADY_EXISTS';
      error.field = field;
      throw error;
    }

    // Crear nuevo usuario
    const user = new User({
      username,
      email: email.toLowerCase(),
      password
    });

    await user.save();

    // Generar token
    const token = this.generateToken({
      userId: user._id,
      email: user.email
    });

    return {
      user,
      token
    };
  }

  //Autenticar usuario
  static async loginUser(email, password) {
    // Buscar usuario con contraseña
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      const error = new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      throw error;
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      const error = new Error(MESSAGES.ERROR.INVALID_CREDENTIALS);
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      throw error;
    }

    // Generar token
    const token = this.generateToken({
      userId: user._id,
      email: user.email
    });

    return {
      user,
      token
    };
  }
}

module.exports = AuthService;