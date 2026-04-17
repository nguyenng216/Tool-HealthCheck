import { NodeSSH } from 'node-ssh';
import { SshCommandDto } from './dto/ssh-command.dto';
import { SshCommand } from './interfaces/ssh.interface';
export declare class SshService {
    private readonly logger;
    connect(options: {
        host: string;
        username: string;
        password: string;
        port?: number;
    }): Promise<NodeSSH>;
    executeCommand(payload: SshCommandDto): Promise<SshCommand>;
}
