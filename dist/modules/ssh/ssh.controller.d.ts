import { SshCommandDto } from './dto/ssh-command.dto';
import { SshService } from './ssh.service';
export declare class SshController {
    private readonly sshService;
    constructor(sshService: SshService);
    execute(payload: SshCommandDto): Promise<import("./interfaces/ssh.interface").SshCommand>;
}
