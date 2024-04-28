import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import {
  AddressResponse,
  CreateAddressRequire,
  GetAddressRequest,
  UpdateAddressRequest,
} from '../model/address.model';
import { WebResponse } from '../model/web.model';

@Controller('/api/contacts/:contactId/addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateAddressRequire,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<AddressResponse>> {
    request.contact_id = contactId;
    const address = await this.addressService.create(user, request);
    return {
      data: address,
    };
  }

  @Get('/:addressId')
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<AddressResponse>> {
    const request: GetAddressRequest = {
      contactId: contactId,
      addressId: addressId,
    };
    const address = await this.addressService.get(user, request);
    return {
      data: address,
    };
  }

  @Put('/:addressId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Body() request: UpdateAddressRequest,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<AddressResponse>> {
    request.id = addressId;
    request.contact_id = contactId;
    const address = await this.addressService.update(user, request);
    return {
      data: address,
    };
  }

  @Delete('/:addressId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<string>> {
    const request: GetAddressRequest = {
      contactId: contactId,
      addressId: addressId,
    };
    await this.addressService.remove(user, request);
    return {
      data: 'Address Was Deleted',
    };
  }

  @Get()
  @HttpCode(200)
  async list(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<AddressResponse[]>> {
    const request: number = contactId;
    const address = await this.addressService.list(user, request);
    return {
      data: address,
    };
  }
}
