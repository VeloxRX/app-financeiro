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
const express_1 = require("express");
const controller = __importStar(require("./auth.controller"));
const auth_1 = require("../../middleware/auth");
const rateLimit_1 = require("../../middleware/rateLimit");
const validate_1 = require("../../middleware/validate");
const auth_schemas_1 = require("./auth.schemas");
const router = (0, express_1.Router)();
router.post('/register', rateLimit_1.authLimiter, (0, validate_1.validate)(auth_schemas_1.registerSchema), controller.register);
router.post('/login', rateLimit_1.authLimiter, (0, validate_1.validate)(auth_schemas_1.loginSchema), controller.login);
router.post('/logout', auth_1.authMiddleware, controller.logout);
router.get('/profile', auth_1.authMiddleware, controller.getProfile);
router.put('/profile', auth_1.authMiddleware, (0, validate_1.validate)(auth_schemas_1.updateProfileSchema), controller.updateProfile);
router.post('/reset-pass', rateLimit_1.authLimiter, controller.resetPassword);
router.post('/refresh', controller.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map