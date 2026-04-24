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
const service = __importStar(require("./categories.service"));
const errorHandler_1 = require("../../middleware/errorHandler");
async function list(req, res, next) {
    try {
        const categories = await service.listCategories(req.userId);
        res.json(categories);
    }
    catch (error) {
        next(error);
    }
}
async function create(req, res, next) {
    try {
        const category = await service.createCategory(req.userId, req.body);
        res.status(201).json(category);
    }
    catch (error) {
        next(error);
    }
}
async function update(req, res, next) {
    try {
        const category = await service.updateCategory(req.userId, req.params.id, req.body);
        if (!category)
            return next(new errorHandler_1.AppError('Categoria não encontrada', 404));
        res.json(category);
    }
    catch (error) {
        next(error);
    }
}
async function remove(req, res, next) {
    try {
        await service.deleteCategory(req.userId, req.params.id);
        res.json({ message: 'Categoria excluída' });
    }
    catch (error) {
        if (error.message === 'SYSTEM_CATEGORY')
            return next(new errorHandler_1.AppError('Categorias do sistema não podem ser excluídas', 403));
        next(error);
    }
}
//# sourceMappingURL=categories.controller.js.map