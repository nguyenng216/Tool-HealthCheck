export declare enum CliProtocol {
    Ssh = "ssh",
    Telnet = "telnet",
    Serial = "serial"
}
export declare class LiveConnectivityDto {
    deviceId: number;
    ip?: string;
    sshUsername?: string;
    sshPassword?: string;
    sshPort?: number;
    sshAdapter?: string;
    cliProtocol?: CliProtocol;
    telnetPort?: number;
    serialPort?: string;
    serialBaudRate?: number;
    snmpCommunity: string;
    snmpVersion?: string;
    snmpInterfaceIndex?: number;
}
