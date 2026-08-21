"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SERVICES_DATA = [
    // A. EMERGENCY RESPONSE
    { num: 1, code: 'EMG-01', name: '24x7 emergency helpline, one number', cat: client_1.ServiceCategoryName.A_EMERGENCY, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
    { num: 2, code: 'EMG-02', name: 'Emergency medical profile (ICEI���]��\��X�P�]Y�ܞS�[YK�W�SQT��S��K�X�N��N�K^T\�\�N��[�K�]�X���Z\�N��[\�ܛ�N��]�\Έ[���YHK���[N����N�	�SQ�L���[YN�	�[X�[[��H\�]�	���ܙ[�][ۉ��]��\��X�P�]Y�ܞS�[YK�W�SQT��S��K�X�N��N�MK^T\�\�N��[�K�]�X���Z\�N��[\�ܛ�N��]�\Έ[���YHK���[N� }
];
//# sourceMappingURL=seed.js.map