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
exports.list = list;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.remove = remove;
const service = __importStar(require("./alerts.service"));
async function list(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const unreadOnly = req.query.unread === 'true';
        const result = await service.listAlerts(req.userId, page, limit, unreadOnly);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function markRead(req, res, next) {
    try {
        await service.markAsRead(req.userId, req.params.id);
        res.json({ message: 'Alerta marcado como lido' });
    }
    catch (error) {
        next(error);
    }
}
async function markAllRead(req, res, next) {
    try {
        await service.markAllAsRead(req.userId);
        res.json({ message: 'Todos os alertas marcados como lidos' });
    }
    catch (error) {
        next(error);
    }
}
async function remove(req, res, next) {
    try {
        await service.deleteAlert(req.userId, req.params.id);
        res.json({ message: 'Alerta excluído' });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=alerts.controller.js.map