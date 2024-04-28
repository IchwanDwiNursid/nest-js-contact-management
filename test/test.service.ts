import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async deleteContact() {
    await this.prismaService.contact.deleteMany({
      where: {
        username: 'test',
      },
    });
  }
  async getUser(): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: {
        username: 'test',
      },
    });

    return user;
  }
  async createUser() {
    await this.prismaService.user.create({
      data: {
        username: 'test',
        password: await argon2.hash('test'),
        name: 'test',
        token: 'test',
      },
    });
  }

  // ========== get Contact ==========
  async getContact() {
    const contact = await this.prismaService.contact.findFirst({
      where: {
        username: 'test',
      },
    });
    return contact;
  }

  // =========== create contact ==========
  async createContact() {
    await this.prismaService.contact.create({
      data: {
        username: 'test',
        first_name: 'test',
        last_name: 'test',
        email: 'test@example.com',
        phone: '123479290909',
      },
    });
  }

  //=========Delete Address=============
  async deleteAddress() {
    await this.prismaService.address.deleteMany({
      where: {
        country: 'test',
      },
    });
  }

  // ========== create address =======
  async createAddress() {
    const contact = await this.getContact();
    await this.prismaService.address.create({
      data: {
        country: 'test',
        city: 'test',
        province: 'test',
        street: 'test',
        postal_code: 'test',
        contact_id: contact.id,
      },
    });
  }

  async getAddress() {
    return await this.prismaService.address.findFirst({
      where: {
        country: 'test',
      },
    });
  }
}
