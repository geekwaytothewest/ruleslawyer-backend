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
    try {
      return ctx.prisma.user.findUnique({
        where: userWhereUniqueInput,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async convertToUserId(id: string, ctx: Context) {
    let userId: number = Number(id);

    if (!Number.isInteger(userId)) {
      const user = await ctx.prisma.user.findUnique({
        where: { email: id },
      });

      userId = Number(user?.id);
    }

    return userId;
  }

  async createUser(data: Prisma.UserCreateInput, ctx: Context): Promise<User> {
    try {
      return ctx.prisma.user.create({
        data,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async updateUser(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: Prisma.UserUpdateInput;
    },
    ctx: Context,
  ): Promise<User> {
    const { where, data } = params;
    try {
      return ctx.prisma.user.update({
        data,
        where,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async getUserCount(ctx: Context) {
    return ctx.prisma.user.count();
  }
}
