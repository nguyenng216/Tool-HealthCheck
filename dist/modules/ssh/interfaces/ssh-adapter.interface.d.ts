export interface SshAdapter {
    getCommand(key: string): string;
    parseOutput(commandKey: string, output: string): Record<string, unknown>;
}
