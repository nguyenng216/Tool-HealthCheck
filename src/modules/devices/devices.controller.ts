import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesService } from './devices.service';

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @Roles(Role.Admin, Role.Operator)
  create(@Body() payload: CreateDeviceDto) {
    return this.devicesService.create(payload);
  }

  @Get()
  @Roles(Role.Admin, Role.Operator)
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Operator)
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(Number(id));
  }

  @Put(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() payload: UpdateDeviceDto) {
    return this.devicesService.update(Number(id), payload);
  }
}
