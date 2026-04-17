import { Injectable, Logger } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';
import { SshCommandDto } from './dto/ssh-command.dto';
import { SshCommand } from './interfaces/ssh.interface';
import { CiscoAdapter } from './adapters/cisco.adapter';

@Injectable()
export class SshService {
  private readonly logger = new Logger(SshService.name);

  async connect(options: {
    host: string;
    username: string;
    password: string;
    port?: number;
  }): Promise<NodeSSH> {
    const ssh = new NodeSSH();
    await ssh.connect({
      host: options.host,
      username: options.username,
      password: options.password,
      port: options.port ?? 22,
      readyTimeout: 20000,
    });
    return ssh;
  }

  async executeCommand(payload: SshCommandDto): Promise<SshCommand> {
    const ssh = await this.connect({
      host: payload.target,
      username: payload.username,
      password: payload.password,
      port: payload.port,
    });

    try {
      const command = payload.command ?? (payload.commandKey ? CiscoAdapter.getCommand(payload.commandKey) : '');
      this.logger.debug(`Executing SSH command on ${payload.target}: ${command}`);

      const result = await ssh.execCommand(command, { execOptions: { pty: true } });
      const parsed = payload.adapter === 'cisco'
        ? CiscoAdapter.parseOutput(payload.commandKey ?? command, result.stdout)
        : null;

      return {
        target: payload.target,
        command,
        stdout: result.stdout,
        stderr: result.stderr,
        parsed,
        executedAt: new Date(),
      };
    } finally {
      ssh.dispose();
    }
  }
}
