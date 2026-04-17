import { Body, Controller, Post } from '@nestjs/common';
import { SshCommandDto } from './dto/ssh-command.dto';
import { SshService } from './ssh.service';

@Controller('ssh')
export class SshController {
  constructor(private readonly sshService: SshService) {}

  @Post('execute')
  execute(@Body() payload: SshCommandDto) {
    return this.sshService.executeCommand(payload);
  }
}
