import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './interfaces/device.interface';
export declare class DevicesService {
    private readonly prisma;
    private readonly cryptoService;
    constructor(prisma: PrismaService, cryptoService: CryptoService);
    create(payload: CreateDeviceDto): Promise<Device>;
    findAll(): Promise<Device[]>;
    findOne(id: number): Promise<Device>;
    update(id: number, payload: UpdateDeviceDto): Promise<Device>;
}
