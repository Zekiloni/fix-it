import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { Problem, ProblemSchema } from './schemas/problem.schema';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }]),
    OrganizationsModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [ProblemsController],
  providers: [ProblemsService],
  exports: [ProblemsService],
})
export class ProblemsModule {}
