import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { UserRepository } from "src/modules/user/repositories/UserRepository";
import { PrismaUserRepository } from "./prisma/repositories/PrismaUserRepository";
import { PrismaUserMapper } from "./prisma/mappers/PrismaUserMapper";
import { EncryptionService } from "src/modules/services/encryptionService";

@Module({
    providers: [
        PrismaService,
        PrismaUserMapper,
        EncryptionService,
        {
            provide: UserRepository,
            useClass: PrismaUserRepository
        },
    ],
    exports: [PrismaService, UserRepository, EncryptionService]
})
export class DatabaseModule {}