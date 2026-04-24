"use strict";
/**
 * Banking Provider Abstraction Layer
 * Prepared for future integration with Open Banking APIs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenFinanceBrasilProvider = void 0;
/**
 * Placeholder for Open Finance Brasil provider.
 * Follow BACEN standards for implementation.
 */
class OpenFinanceBrasilProvider {
    name = 'Open Finance Brasil';
    country = 'BR';
    async authenticate(_credentials) {
        throw new Error('Open Finance Brasil integration not yet implemented');
    }
    async refreshAuth(_token) {
        throw new Error('Not implemented');
    }
    async getAccounts(_token) {
        throw new Error('Not implemented');
    }
    async getBalance(_token, _accountId) {
        throw new Error('Not implemented');
    }
    async getTransactions(_token, _accountId, _from, _to) {
        throw new Error('Not implemented');
    }
}
exports.OpenFinanceBrasilProvider = OpenFinanceBrasilProvider;
//# sourceMappingURL=banking.provider.js.map