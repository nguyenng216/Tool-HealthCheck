export type TelnetExecOptions = {
    host: string;
    port?: number;
    username: string;
    password: string;
    command: string;
    shellPrompt?: string;
    timeoutMs?: number;
};
export declare class TelnetService {
    executeCommand(options: TelnetExecOptions): Promise<string>;
}
