import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from '../model/contact.model';
import { Contact, User } from '@prisma/client';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ContactValidation } from './contact.validation';
import { WebResponse } from '../model/web.model';

@Injectable()
export class ContactService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private prismaService: PrismaService,
  ) {}

  async create(
    user: User,
    request: CreateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.info(
      `ContactService.Create  ===========3333333===================>${JSON.stringify(request.last_name)}`,
    );

    const contactRequest: any = this.validationService.validate(
      ContactValidation.CREATE,
      request,
    );

    const contact = await this.prismaService.contact.create({
      data: {
        ...contactRequest,
        username: user.username,
      },
    });

    return this.toContactResponse(contact);
  }

  toContactResponse(contact: Contact): ContactResponse {
    return {
      id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
    };
  }

  async checkContactMustExist(user: User, contactId: number): Promise<Contact> {
    const contact = await this.prismaService.contact.findFirst({
      where: {
        id: contactId,
        username: user.username,
      },
    });

    if (!contact) {
      throw new HttpException('Contact Not Found', 404);
    }

    return contact;
  }

  async get(user: User, contactId: number): Promise<ContactResponse> {
    const contact = await this.checkContactMustExist(user, contactId);
    return this.toContactResponse(contact);
  }

  async update(
    user: User,
    request: UpdateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.info(`ContactService.Update ${JSON.stringify(request)}`);

    const contactRequest: any = this.validationService.validate(
      ContactValidation.UPDATE,
      request,
    );

    let contact = await this.checkContactMustExist(user, contactRequest.id);

    contact = await this.prismaService.contact.update({
      where: {
        id: contact.id,
        username: contact.username,
      },
      data: contactRequest,
    });

    return this.toContactResponse(contact);
  }

  async remove(user: User, contactId: number): Promise<ContactResponse> {
    await this.checkContactMustExist(user, contactId);

    const contact = await this.prismaService.contact.delete({
      where: {
        id: contactId,
        username: user.username,
      },
    });

    return this.toContactResponse(contact);
  }

  async search(
    user: User,
    request: SearchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    const searchContactRequest: any = await this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );

    const filters = [];

    if (searchContactRequest.name) {
      filters.push({
        OR: [
          {
            first_name: {
              contains: searchContactRequest.name, // containes = like
            },
          },
          {
            last_name: {
              contains: searchContactRequest.name,
            },
          },
        ],
      });
    }

    if (searchContactRequest.email) {
      filters.push({
        email: {
          contains: searchContactRequest.email,
        },
      });
    }

    if (searchContactRequest.phone) {
      filters.push({
        phone: {
          contains: searchContactRequest.phone,
        },
      });
    }

    // ==============Rumus Skip Data ==============
    const skip = (searchContactRequest.page - 1) * searchContactRequest.size;

    const contacts = await this.prismaService.contact.findMany({
      where: {
        username: user.username,
        AND: filters,
      },
      take: searchContactRequest.size, // ambil berapa data
      skip: skip, // data yg di skip / di hiraukan
    });

    const total = await this.prismaService.contact.count({
      where: {
        username: user.username,
        AND: filters,
      },
    });

    return {
      data: contacts.map((contact) => this.toContactResponse(contact)),
      paging: {
        current_page: searchContactRequest.page,
        size: searchContactRequest.size,
        total_page: Math.ceil(total / searchContactRequest.size),
      },
    };
  }
}
