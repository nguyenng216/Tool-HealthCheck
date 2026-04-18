"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: Number(process.env.PORT) || 3000,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
    encryptionKey: process.env.ENCRYPTION_KEY || 'default_32_byte_secret_key_1234',
    puttyPlinkPath: process.env.PUTTY_PLINK_PATH || 'plink',
});
//# sourceMappingURL=configuration.js.map