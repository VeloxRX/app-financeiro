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
exports.deposit = deposit;
const service = __importStar(require("./goals.service"));
const errorHandler_1 = require("../../middleware/errorHandler");
async function list(req, res, next) {
    try {
        const goals = await service.listGoals(req.userId);
        res.json(goals);
    }
    catch (error) {
        next(error);
    }
}
async function create(req, res, next) {
    try {
        const goal = await service.createGoal(req.userId, req.body);
        res.status(201).json(goal);
    }
    catch (error) {
        next(error);
    }
}
async function update(req, res, next) {
    try {
        const goal = await service.updateGoal(req.userId, req.params.id, req.body);
        if (!goal)
            return next(new errorHandler_1.AppError('Meta não encontrada', 404));
        res.json(goal);
    }
    catch (error) {
        next(error);
    }
}
async function remove(req, res, next) {
    try {
        await service.deleteGoal(req.userId, req.params.id);
        res.json({ message: 'Meta excluída' });
    }
    catch (error) {
        next(error);
    }
}
async function deposit(req, res, next) {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0)
            return next(new errorHandler_1.AppError('Valor inválido', 400));
        const goal = await service.depositToGoal(req.userId, req.params.id, amount);
        if (!goal)
            return next(new errorHandler_1.AppError('Meta não encontrada', 404));
        res.json(goal);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=goals.controller.js.map