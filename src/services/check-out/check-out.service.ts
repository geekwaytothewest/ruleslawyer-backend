import { Injectable } from '@nestjs/common';
import { CopyService } from '../copy/copy.service';
import { Context } from '../prisma/context';
import { AttendeeService } from '../attendee/attendee.service';

@Injectable()
export class CheckOutService {
  constructor(
    private readonly copyService: CopyService,
    private readonly attendeeService: AttendeeService,
  ) {}

  async checkOut(
    collectionId: number,
    copyBarcode: string,
    conventionId: number,
    attendeeBarcode: string,
    ctx: Context,
  ) {
    const copy = await this.copyService.copyWithCheckouts(
      {
        collectionId_barcode: {
          collectionId: collectionId,
          barcode: copyBarcode,
        },
      },
      ctx,
    );

    if (!copy) {
      return Promise.reject('copy not found');
    }

    if (copy.checkOuts.filter((co) => !co.checkIn).length > 0) {
      return Promise.reject('already checked out');
    }

    const attendee = await this.attendeeService.attendeeWithCheckouts(
      {
        conventionId_barcode: {
          conventionId: conventionId,
          barcode: attendeeBarcode,
        },
      },
      ctx,
    );

    if (!attendee) {
      return Promise.reject('attendee not found');
    }

    if (attendee.checkOuts.filter((co) => !co.checkIn).length > 0) {
      return Promise.reject('attendee already has a game checked out');
    }

    return await ctx.prisma.checkOut.create({
      data: {
        copyId: copy.id,
        checkOut: new Date(),
        attendeeId: attendee.id,
      },
    });
  }

  async checkIn(collectionId: number, copyBarcode: string, ctx: Context) {
    const copy = await this.copyService.copyWithCheckouts(
      {
        collectionId_barcode: {
          collectionId: Number(collectionId),
          barcode: copyBarcode,
        },
      },
      ctx,
    );

    if (!copy) {
      return Promise.reject('copy not found');
    }

    const checkOuts = copy.checkOuts.filter((co) => !co.checkIn);

    if (checkOuts.length === 0) {
      return Promise.reject('already checked in');
    }

    const checkOut = checkOuts[0];

    return await ctx.prisma.checkOut.update({
      where: {
        id: checkOut.id,
      },
      data: {
        checkIn: new Date(),
      },
    });
  }
}
