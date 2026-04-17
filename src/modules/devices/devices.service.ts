import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './interfaces/device.interface';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(payload: CreateDeviceDto): Promise<Device> {
    const credentialEncrypted = payload.credential
      ? this.cryptoService.encrypt(payload.credential)
      : null;

    return this.prisma.device.create({
      data: {
        name: payload.name,
        ip: payload.ip,
        type: payload.type,
        credentialEncrypted,
      },
    });
  }

  async findAll(): Promise<Device[]> {
    return this.prisma.device.findMany();
  }

  async findOne(id: number): Promise<Device> {
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device ${id} not found`);
    }
    return device;
  }

  async update(id: number, payload: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(id);
    const credentialEncrypted = payload.credential
      ? this.cryptoService.encrypt(payload.credential)
      : device.credentialEncrypted;

    return this.prisma.device.update({
      where: { id },
      data: {
        name: payload.name ?? device.name,
        ip: payload.ip ?? device.ip,
        type: payload.type ?? device.type,
        credentialEncrypted,
      },
    });
  }
}
