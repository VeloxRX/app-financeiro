"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.resetPassword = resetPassword;
exports.refreshToken = refreshToken;
const authService = __importStar(require("./auth.service"));
const errorHandler_1 = require("../../middleware/errorHandler");
async function register(req, res, next) {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        if (error.message === 'EMAIL_EXISTS') {
            return next(new errorHandler_1.AppError('Este email já está cadastrado', 409));
        }
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const result = await authService.login(req.body.email, req.body.password);
        res.json(result);
    }
    catch (error) {
        if (error.message === 'INVALID_CREDENTIALS') {
            return next(new errorHandler_1.AppError('Email ou senha incorretos', 401));
        }
        next(error);
    }
}
async function logout(req, res, next) {
    try {
        res.json({ message: 'Logout realizado com sucesso' });
    }
    catch (error) {
        next(error);
    }
}
async function getProfile(req, res, next) {
    try {
        const user = await authService.getProfile(req.userId);
        if (!user)
            return next(new errorHandler_1.AppError('Usuário não encontrado', 404));
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
async function updateProfile(req, res, next) {
    try {
        const user = await authService.updateProfile(req.userId, req.body);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
async function resetPassword(req, res, next) {
    try {
        await authService.resetPassword(req.body.email);
        res.json({ message: 'Se o email existir, enviaremos instruções de recuperação' });
    }
    catch (error) {
        next(error);
    }
}
async function refreshToken(req, res, next) {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token)
            return next(new errorHandler_1.AppError('Refresh token é obrigatório', 400));
        const result = await authService.refreshToken(refresh_token);
        res.json(result);
    }
    catch (error) {
        if (error.message === 'INVALID_REFRESH_TOKEN') {
            return next(new errorHandler_1.AppError('Refresh token inválido ou expirado', 401));
        }
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map