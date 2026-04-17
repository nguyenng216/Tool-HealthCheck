import { SshAdapter } from '../interfaces/ssh-adapter.interface';
export declare class CiscoAdapter implements SshAdapter {
    private static readonly commandMap;
    getCommand(key: string): string;
    parseOutput(commandKey: string, output: string): Record<string, unknown>;
    static getCommand(key: string): string;
    static parseOutput(commandKey: string, output: string): Record<string, unknown>;
    private static parseShowVersion;
    private static parseInterfaceBrief;
    private static parseInterfacesStatus;
}
