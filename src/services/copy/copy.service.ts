import { Injectable } from '@nestjs/common';
import { Copy, Prisma } from '@prisma/client';
import { Context } from '../prisma/context';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';

@Injectable()
export class CopyService {
	private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(CopyService.name);
  async copy(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<Copy | null> {
		try {
      return ctx.prisma.copy.findUnique({
        where: copyWhereUniqueInput,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async copyWithCollection(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    try {
      return ctx.prisma.copy.findUnique({
        where: copyWhereUniqueInput,
        include: {
          collection: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async copyWithCheckouts(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
		try {
			this.logger.log(`Getting copy with checkouts with copy=${JSON.stringify(copyWhereUniqueInput)}`);
      return ctx.prisma.copy.findUnique({
				where: copyWhereUniqueInput,
        include: {
					checkOuts: true,
        },
      });
    } catch (ex) {
			this.logger.error(`Failed to get copy with checkouts with copy=${JSON.stringify(copyWhereUniqueInput)}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async copyWithCheckOutsGameAndCollection(
    copyWhereUniqueInput: Prisma.CopyWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
		try {
			this.logger.log(`Getting copy with checkouts, game, collection with copy=${JSON.stringify(copyWhereUniqueInput)}`);
      return ctx.prisma.copy.findUnique({
				where: copyWhereUniqueInput,
        include: {
					collection: true,
          checkOuts: {
						include: {
							attendee: true,
            },
          },
          game: true,
        },
      });
    } catch (ex) {
			this.logger.error(`Failed to get copy with checkouts, game, collection with copy=${JSON.stringify(copyWhereUniqueInput)}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async createCopy(
    data: Prisma.CopyCreateInput,
    ctx: Context,
  ): Promise<Copy | null> {
		try {
			this.logger.log(`Creating copy with data=${JSON.stringify(data)}`);
      return ctx.prisma.copy.create({ data });
    } catch (ex) {
			this.logger.error(`Failed to create copy with data=${JSON.stringify(data)}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async updateCopy(
    params: {
      where: Prisma.CopyWhereUniqueInput;
      data: Prisma.CopyUpdateInput;
    },
    ctx: Context,
  ) {
    const { where, data } = params;

		try {
			this.logger.log(`Updating copy with data=${JSON.stringify(data)}, where=${JSON.stringify(where)}`)
      return ctx.prisma.copy.update({ data, where });
    } catch (ex) {
			this.logger.error(`Failed to update copy with data=${JSON.stringify(data)}, where=${JSON.stringify(where)}, ex=${ex}`);
      return Promise.reject(ex);
    }
  }

  async searchCopies(where: Prisma.CopyWhereInput, ctx: Context) {
		try {
			this.logger.log(`Searching copies with where=${JSON.stringify(where)}`)
			return ctx.prisma.copy.findMany({
				where: where,
        include: {
					collection: {
						include: {
							organization: true,
            },
          },
          game: true,
          checkOuts: {
						include: {
							attendee: true,
            },
          },
        },
      });
    } catch (ex) {
			this.logger.log(`Failed to search copies with where=${JSON.stringify(where)}, ex=${ex}`)
      return Promise.reject(ex);
    }
  }
}
