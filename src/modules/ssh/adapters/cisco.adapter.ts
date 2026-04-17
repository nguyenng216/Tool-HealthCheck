import { SshAdapter } from '../interfaces/ssh-adapter.interface';

export class CiscoAdapter implements SshAdapter {
  private static readonly commandMap: Record<string, string> = {
    showVersion: 'show version',
    showIpInterfaceBrief: 'show ip interface brief',
    showInterfacesStatus: 'show interfaces status',
  };

  getCommand(key: string): string {
    return CiscoAdapter.getCommand(key);
  }

  parseOutput(commandKey: string, output: string): Record<string, unknown> {
    return CiscoAdapter.parseOutput(commandKey, output);
  }

  static getCommand(key: string): string {
    const command = this.commandMap[key];
    if (!command) {
      throw new Error(`Unsupported Cisco command key: ${key}`);
    }
    return command;
  }

  static parseOutput(commandKey: string, output: string): Record<string, unknown> {
    switch (commandKey) {
      case 'showVersion':
        return this.parseShowVersion(output);
      case 'showIpInterfaceBrief':
        return this.parseInterfaceBrief(output);
      case 'showInterfacesStatus':
        return this.parseInterfacesStatus(output);
      default:
        return { raw: output };
    }
  }

  private static parseShowVersion(output: string): Record<string, unknown> {
    const lines = output.split(/\r?\n/);
    const result: Record<string, unknown> = {};
    lines.forEach((line) => {
      if (/Cisco IOS Software/i.test(line)) {
        result.os = line.trim();
      }
      const versionMatch = line.match(/Version\s+([\d.()A-Za-z-]+)/i);
      if (versionMatch) {
        result.version = versionMatch[1];
      }
      const uptimeMatch = line.match(/uptime is\s+(.+)$/i);
      if (uptimeMatch) {
        result.uptime = uptimeMatch[1].trim();
      }
    });
    return result;
  }

  private static parseInterfaceBrief(output: string): Record<string, unknown> {
    const lines = output.split(/\r?\n/);
    const interfaces = lines
      .filter((line) => /^[A-Za-z]/.test(line) && !line.startsWith('Interface'))
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        return {
          interface: parts[0],
          ipAddress: parts[1],
          status: parts[4],
          protocol: parts[5],
        };
      });
    return { interfaces };
  }

  private static parseInterfacesStatus(output: string): Record<string, unknown> {
    const lines = output.split(/\r?\n/);
    const interfaces = lines
      .filter((line) => /^[A-Za-z]/.test(line) && !line.startsWith('Port'))
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        return {
          port: parts[0],
          name: parts[1],
          status: parts[2],
          vlan: parts[3],
          duplex: parts[4],
          speed: parts[5],
          type: parts.slice(6).join(' '),
        };
      });
    return { interfaces };
  }
}
