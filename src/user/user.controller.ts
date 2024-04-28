import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from '../model/web.model';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { User } from '@prisma/client';
import { Auth } from '../common/auth.decorator';
import { CreatedAtInterceptor } from '../common/created-at.interceptor';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(200)
  @Header('Content-Type', 'application/json')
  @UseInterceptors(CreatedAtInterceptor)
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(request);
    return {
      data: result,
    };
  }

  @Post('/login')
  @HttpCode(200)
  @Header('Content-Type', 'application/json')
  @UseInterceptors(CreatedAtInterceptor)
  async login(
    @Body() request: LoginUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.login(request);
    return {
      data: result,
    };
  }

  @Get('/current')
  @HttpCode(200)
  @Header('Content-Type', 'application/json')
  async get(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.get(user);
    return {
      data: result,
    };
  }

  @Patch('/current')
  @HttpCode(200)
  @Header('Content-Type', 'application/json')
  async update(
    @Body() request: UpdateUserRequest,
    @Auth() user: User,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.update(user, request);
    return {
      data: result,
    };
  }

  @Delete('/current')
  @HttpCode(200)
  async logout(@Auth() user: User): Promise<WebResponse<string>> {
    await this.userService.logout(user);
    return {
      data: 'Logout Success',
    };
  }
}
