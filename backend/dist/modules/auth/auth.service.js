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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.resetPassword = resetPassword;
exports.refreshToken = refreshToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const authRepo = __importStar(require("./auth.repository"));
function generateTokens(userId) {
    const access_token = jsonwebtoken_1.default.sign({ userId }, env_1.env.JWT_SECRET, { expiresIn: '15m' });
    const refresh_token = jsonwebtoken_1.default.sign({ userId }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { access_token, refresh_token };
}
async function register(input) {
    const existing = await authRepo.findByEmail(input.email);
    if (existing)
        throw new Error('EMAIL_EXISTS');
    const password_hash = await bcryptjs_1.default.hash(input.password, 12);
    const user = await authRepo.create({
        name: input.name,
        email: input.email,
        password_hash,
        currency: input.currency || 'BRL',
    });
    const tokens = generateTokens(user.id);
    return {
        user: { id: user.id, name: user.name, email: user.email, currency: user.currency },
        ...tokens,
    };
}
async function login(email, password) {
    const user = await authRepo.findByEmail(email);
    if (!user)
        throw new Error('INVALID_CREDENTIALS');
    const valid = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!valid)
        throw new Error('INVALID_CREDENTIALS');
    const tokens = generateTokens(user.id);
    return {
        user: { id: user.id, name: user.name, email: user.email, currency: user.currency },
        ...tokens,
    };
}
async function getProfile(userId) {
    const user = await authRepo.findById(userId);
    if (!user)
        return null;
    const { password_hash, ...profile } = user;
    return profile;
}
async function updateProfile(userId, data) {
    return authRepo.update(userId, data);
}
async function resetPassword(email) {
    const user = await authRepo.findByEmail(email);
    if (!user)
        return; // Silent fail for security
    // In production: send email with reset link
    console.log(`[SMTP] Password reset requested for ${email}`);
}
async function refreshToken(token) {
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
        return generateTokens(payload.userId);
    }
    catch {
        throw new Error('INVALID_REFRESH_TOKEN');
    }
}
//# sourceMappingURL=auth.service.js.map