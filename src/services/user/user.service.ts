import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { Context } from '../prisma/context';

@Injectable()
export class UserService {
  constructor() {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    ctx: Context,
  ): Promise<User | null> {
    return ctx.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async createUser(data: Prisma.UserCreateInput, ctx: Context): Promise<User> {
    return ctx.prisma.user.create({
      data,
    });
  }

  async updateUser(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: Prisma.UserUpdateInput;
    },
    ctx: Context,
  ): Promise<User> {
    const { where, data } = params;
    return ctx.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(
    where: Prisma.UserWhereUniqueInput,
    ctx: Context,
  ): Promise<User> {
    return ctx.prisma.user.delete({
      where,
    });
  }

  async getUserCount(ctx: Context) {
    return ctx.prisma.user.count();
  }
}
