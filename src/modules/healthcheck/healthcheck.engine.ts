import { Injectable, Logger } from '@nestjs/common';
import { readdirSync } from 'fs';
import { extname, join } from 'path';
import { CheckResult, Device, HealthCheck } from './interfaces/healthcheck-plugin.interface';

@Injectable()
export class HealthcheckEngine {
  private readonly logger = new Logger(HealthcheckEngine.name);
  private readonly plugins: HealthCheck[] = [];

  constructor() {
    this.loadPlugins();
  }

  private resolvePluginExport(moduleExport: any): HealthCheck | null {
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
      return moduleExport as HealthCheck;
    }

    return null;
  }

  private loadPlugins(): void {
    const pluginDirectory = join(__dirname, 'checks');
    const pluginFiles = readdirSync(pluginDirectory).filter((file) => {
      if (file.endsWith('.d.ts')) {
        return false;
      }
      const extension = extname(file);
      return extension === '.ts' || extension === '.js';
    });

    for (const file of pluginFiles) {
      const pluginPath = join(pluginDirectory, file);
      try {
        const pluginModule = require(pluginPath);
        const plugin = this.resolvePluginExport(pluginModule);

        if (!plugin) {
          this.logger.warn(`Skipping invalid healthcheck plugin: ${file}`);
          continue;
        }

        this.plugins.push(plugin);
        this.logger.log(`Loaded healthcheck plugin: ${plugin.name}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to load plugin ${file}: ${message}`);
      }
    }
  }

  getPlugins(): HealthCheck[] {
    return [...this.plugins];
  }

  async run(device: Device, mode: 'parallel' | 'sequence' = 'parallel'): Promise<CheckResult[]> {
    const execute = async (plugin: HealthCheck): Promise<CheckResult> => {
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
      const results: CheckResult[] = [];
      for (const plugin of this.plugins) {
        results.push(await execute(plugin));
      }
      return results;
    }

    return Promise.all(this.plugins.map((plugin) => execute(plugin)));
  }
}
