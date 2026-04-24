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
exports.dashboardSummary = dashboardSummary;
exports.cashflow = cashflow;
exports.monthlyReport = monthlyReport;
exports.yearlyReport = yearlyReport;
exports.categoryReport = categoryReport;
exports.trends = trends;
const service = __importStar(require("./reports.service"));
async function dashboardSummary(req, res, next) {
    try {
        const summary = await service.getDashboardSummary(req.userId);
        res.json(summary);
    }
    catch (error) {
        next(error);
    }
}
async function cashflow(req, res, next) {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await service.getCashflow(req.userId, days);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
}
async function monthlyReport(req, res, next) {
    try {
        const { year, month } = req.params;
        const report = await service.getMonthlyReport(req.userId, parseInt(year), parseInt(month));
        res.json(report);
    }
    catch (error) {
        next(error);
    }
}
async function yearlyReport(req, res, next) {
    try {
        const { year } = req.params;
        const report = await service.getYearlyReport(req.userId, parseInt(year));
        res.json(report);
    }
    catch (error) {
        next(error);
    }
}
async function categoryReport(req, res, next) {
    try {
        const report = await service.getCategoryReport(req.userId, req.params.id);
        res.json(report);
    }
    catch (error) {
        next(error);
    }
}
async function trends(req, res, next) {
    try {
        const data = await service.getTrends(req.userId);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=reports.controller.js.map