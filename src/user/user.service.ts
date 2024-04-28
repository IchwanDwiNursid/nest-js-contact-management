import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { UserValidation } from './user.validation';
import * as argon2 from 'argon2';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}
  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`create new user ${JSON.stringify(request)}`);
    const registerRequest: any = this.validationService.validate(
      UserValidation.REGISTER,
      request,
    );

    const totalUser = await this.prismaService.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    if (totalUser != 0) {
      throw new HttpException('Username Alredy Exist', 400);
    }

    registerRequest.password = await argon2.hash(registerRequest.password);

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.info(`UserService.Login ${JSON.stringify(request)}`);
    const loginRequest: any = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    let user = await this.prismaService.user.findUnique({
      where: {
        username: loginRequest.username,
      },
    });

    if (!user) {
      throw new HttpException('Username or Password Invalid', 401);
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      loginRequest.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Username or Password Invalid', 401);
    }

    const token = uuid();

    user = await this.prismaService.user.update({
      where: {
        username: loginRequest.username,
      },
      data: {
        token: token,
      },
    });

    return {
      username: user.username,
      name: user.name,
      token: user.token,
    };
  }

  async get(user: User): Promise<UserResponse> {
    return {
      username: user.username,
      name: user.name,
    };
  }

  async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
    this.logger.info(
      `UserService.Update ${JSON.stringify(user)}, ${JSON.stringify(request)}`,
    );

    const updateUser: UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE,
      request,
    );

    if (updateUser.name) {
      user.name = updateUser.name;
    }

    if (updateUser.password) {
      user.password = await argon2.hash(updateUser.password);
    }

    const result = await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: user,
    });

    return {
      name: result.name,
      username: result.username,
    };
  }

  async logout(user: User): Promise<void> {
    await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: {
        token: null,
      },
    });
  }
}
