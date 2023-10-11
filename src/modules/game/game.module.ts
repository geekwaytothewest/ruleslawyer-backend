import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserService } from '../../services/user/user.service';
import { GameController } from '../../controllers/game/game.controller';
import { GameService } from '../../services/game/game.service';

@Module({
  controllers: [GameController],
  providers: [UserService, PrismaService, GameService],
  exports: [GameService],
})
export class GameModule {}
