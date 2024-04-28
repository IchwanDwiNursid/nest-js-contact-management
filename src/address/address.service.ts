import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  AddressResponse,
  CreateAddressRequire,
  GetAddressRequest,
  UpdateAddressRequest,
} from '../model/address.model';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationService } from '../common/validation.service';
import { AddressValidation } from './address.validation';
import { Address, User } from '@prisma/client';
import { ContactService } from '../contact/contact.service';

@Injectable()
export class AddressService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private contactService: ContactService,
  ) {}

  async create(
    user: User,
    request: CreateAddressRequire,
  ): Promise<AddressResponse> {
    this.logger.info(`Create New Address ${JSON.stringify(request)}`);

    const requestAddress: any = this.validationService.validate(
      AddressValidation.CREATE,
      request,
    );

    this.contactService.checkContactMustExist(user, request.contact_id);

    const address = await this.prismaService.address.create({
      data: requestAddress,
    });

    return this.toAddressResponse(address);
  }

  toAddressResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      city: address.city,
      street: address.street,
      postal_code: address.postal_code,
      province: address.province,
      country: address.country,
    };
  }

  async checkAddressMustExist(
    contactId: number,
    addressId: number,
  ): Promise<Address> {
    const address = await this.prismaService.address.findFirst({
      where: {
        id: addressId,
        contact_id: contactId,
      },
    });

    if (!address) {
      throw new HttpException('Address Not Found', 404);
    }

    return address;
  }

  async get(user: User, request: GetAddressRequest): Promise<AddressResponse> {
    this.logger.info(`Get Address ${JSON.stringify(request)}`);

    await this.contactService.checkContactMustExist(user, request.contactId);

    const address = await this.checkAddressMustExist(
      request.contactId,
      request.addressId,
    );

    return this.toAddressResponse(address);
  }

  async update(
    user: User,
    request: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.info(`Update Address ${JSON.stringify(request)}`);

    const updateRequest: any = this.validationService.validate(
      AddressValidation.UPDATE,
      request,
    );
    await this.contactService.checkContactMustExist(
      user,
      updateRequest.contact_id,
    );

    let address = await this.checkAddressMustExist(
      updateRequest.contact_id,
      updateRequest.id,
    );

    address = await this.prismaService.address.update({
      where: {
        id: address.id,
        contact_id: address.contact_id,
      },
      data: updateRequest,
    });

    return this.toAddressResponse(address);
  }

  async remove(
    user: User,
    request: GetAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.info(`Remove Address ${JSON.stringify(request)}`);

    const removeRequest: any = this.validationService.validate(
      AddressValidation.GET,
      request,
    );

    await this.contactService.checkContactMustExist(
      user,
      removeRequest.contactId,
    );

    let address = await this.checkAddressMustExist(
      removeRequest.contactId,
      removeRequest.addressId,
    );

    address = await this.prismaService.address.delete({
      where: {
        id: address.id,
        contact_id: address.contact_id,
      },
    });

    return this.toAddressResponse(address);
  }

  async list(user: User, contactId: number): Promise<AddressResponse[]> {
    await this.contactService.checkContactMustExist(user, contactId);
    const addresses = await this.prismaService.address.findMany({
      where: {
        contact_id: contactId,
      },
    });

    return addresses.map((address) => this.toAddressResponse(address));
  }
}
