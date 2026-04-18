import { Injectable } from '@nestjs/common';
import { Telnet } from 'telnet-client';

export type TelnetExecOptions = {
  host: string;
  port?: number;
  username: string;
  password: string;
  command: string;
  shellPrompt?: string;
  timeoutMs?: number;
};

@Injectable()
export class TelnetService {
  async executeCommand(options: TelnetExecOptions): Promise<string> {
    const connection = new Telnet();

    try {
      await connection.connect({
        host: options.host,
        port: options.port ?? 23,
        shellPrompt: options.shellPrompt ?? /[#>$]\s?$/,
        timeout: options.timeoutMs ?? 20000,
        username: options.username,
        password: options.password,
        negotiationMandatory: false,
        ors: '\n',
      });

      const output = await connection.exec(options.command, {
        shellPrompt: options.shellPrompt ?? /[#>$]\s?$/,
        timeout: options.timeoutMs ?? 20000,
      });

      return String(output ?? '');
    } finally {
      connection.end();
    }
  }
}
