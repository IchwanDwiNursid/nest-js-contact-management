export type RegisterUserRequest = {
  username: string;
  password: string;
  name: string;
};

export class UserResponse {
  username: string;
  name: string;
  token?: string;
}

export class LoginUserRequest {
  username: string;
  passowrd: string;
}

export class UpdateUserRequest {
  name?: string;
  password?: string;
}
