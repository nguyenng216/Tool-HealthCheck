import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum CliProtocol {
  Ssh = 'ssh',
  Telnet = 'telnet',
  Serial = 'serial',
}

export class LiveConnectivityDto {
  @IsInt()
  @Min(1)
  deviceId!: number;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  sshUsername?: string;

  @IsOptional()
  @IsString()
  sshPassword?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sshPort?: number;

  @IsOptional()
  @IsString()
  sshAdapter?: string;

  @IsOptional()
  @IsEnum(CliProtocol)
  cliProtocol?: CliProtocol;

  @IsOptional()
  @IsInt()
  @Min(1)
  telnetPort?: number;

  @IsOptional()
  @IsString()
  serialPort?: string;

  @IsOptional()
  @IsInt()
  @Min(1200)
  serialBaudRate?: number;

  @IsString()
  snmpCommunity!: string;

  @IsOptional()
  @IsString()
  snmpVersion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  snmpInterfaceIndex?: number;
}
