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
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.exportData = exportData;
const service = __importStar(require("./transactions.service"));
const errorHandler_1 = require("../../middleware/errorHandler");
async function list(req, res, next) {
    try {
        const filters = {
            type: req.query.type,
            category_id: req.query.category_id,
            from: req.query.from,
            to: req.query.to,
            search: req.query.search,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
        };
        const result = await service.listTransactions(req.userId, filters);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function create(req, res, next) {
    try {
        const result = await service.createTransaction(req.userId, req.body);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function update(req, res, next) {
    try {
        const result = await service.updateTransaction(req.userId, req.params.id, req.body);
        if (!result)
            return next(new errorHandler_1.AppError('Transação não encontrada', 404));
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function remove(req, res, next) {
    try {
        await service.deleteTransaction(req.userId, req.params.id);
        res.json({ message: 'Transação excluída' });
    }
    catch (error) {
        next(error);
    }
}
async function exportData(req, res, next) {
    try {
        const format = req.query.format || 'csv';
        const data = await service.exportTransactions(req.userId, {
            format,
            from: req.query.from,
            to: req.query.to,
            categories: req.query.categories,
        });
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=transacoes.csv');
        }
        else if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=transacoes.json');
        }
        res.send(data);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=transactions.controller.js.map