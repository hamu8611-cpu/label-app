import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SokoMasterModule } from './soko-master/soko-master.module';
import { HinModule } from './hin/hin.module';
import { InventoryModule } from './inventory/inventory.module';
import { IoModule } from './io/io.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'labeldb',
      autoLoadEntities: true,
      synchronize: false,
    }),

    UsersModule,
    AuthModule,
    SokoMasterModule,
    HinModule,
    InventoryModule,
    IoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
