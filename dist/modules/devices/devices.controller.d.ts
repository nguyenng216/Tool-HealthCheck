import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesService } from './devices.service';
export declare class DevicesController {
    private readonly devicesService;
    constructor(devicesService: DevicesService);
    create(payload: CreateDeviceDto): Promise<import("./interfaces/device.interface").Device>;
    findAll(): Promise<import("./interfaces/device.interface").Device[]>;
    findOne(id: string): Promise<import("./interfaces/device.interface").Device>;
    update(id: string, payload: UpdateDeviceDto): Promise<import("./interfaces/device.interface").Device>;
}
