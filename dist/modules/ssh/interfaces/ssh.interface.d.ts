export interface SshCommand {
    target: string;
    command: string;
    stdout: string;
    stderr: string;
    parsed?: Record<string, unknown> | null;
    executedAt: Date;
}
