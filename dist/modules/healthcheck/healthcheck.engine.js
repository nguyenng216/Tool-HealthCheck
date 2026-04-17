"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HealthcheckEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthcheckEngine = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
let HealthcheckEngine = HealthcheckEngine_1 = class HealthcheckEngine {
    logger = new common_1.Logger(HealthcheckEngine_1.name);
    plugins = [];
    constructor() {
        this.loadPlugins();
    }
    resolvePluginExport(moduleExport) {
        if (!moduleExport) {
            return null;
        }
        if (typeof moduleExport === 'function') {
            return new moduleExport();
        }
        if (moduleExport.default) {
            return this.resolvePluginExport(moduleExport.default);
        }
        if (typeof moduleExport.run === 'function') {
            return moduleExport;
        }
        return null;
    }
    loadPlugins() {
        const pluginDirectory = (0, path_1.join)(__dirname, 'checks');
        const pluginFiles = (0, fs_1.readdirSync)(pluginDirectory).filter((file) => {
            const extension = (0, path_1.extname)(file);
            return extension === '.ts' || extension === '.js';
        });
        for (const file of pluginFiles) {
            const pluginPath = (0, path_1.join)(pluginDirectory, file);
            try {
                const pluginModule = require(pluginPath);
                const plugin = this.resolvePluginExport(pluginModule);
                if (!plugin) {
                    this.logger.warn(`Skipping invalid healthcheck plugin: ${file}`);
                    continue;
                }
                this.plugins.push(plugin);
                this.logger.log(`Loaded healthcheck plugin: ${plugin.name}`);
            }
            catch (error) {
                this.logger.error(`Failed to load plugin ${file}: ${error.message}`);
            }
        }
    }
    getPlugins() {
        return [...this.plugins];
    }
    async run(device, mode = 'parallel') {
        const execute = async (plugin) => {
            const result = await plugin.run(device);
            return {
                ...result,
                metrics: {
                    ...result.metrics,
                    category: plugin.category,
                },
            };
        };
        if (mode === 'sequence') {
            const results = [];
            for (const plugin of this.plugins) {
                results.push(await execute(plugin));
            }
            return results;
        }
        return Promise.all(this.plugins.map((plugin) => execute(plugin)));
    }
};
exports.HealthcheckEngine = HealthcheckEngine;
exports.HealthcheckEngine = HealthcheckEngine = HealthcheckEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HealthcheckEngine);
//# sourceMappingURL=healthcheck.engine.js.map