import { Module } from "@nestjs/common";
import { UserController } from "./controller/user.controller";
import { DatabaseModule } from "src/database/database.module";
import { CreatePsicologoUseCase } from "./useCases/createUserUseCase/create-psicologo.use-case";
import { CreatePacienteWithPsicologoUseCase } from "./useCases/create-paciente-with-psicologo.use-case";
import { ListPacientesUseCase } from "./useCases/list-pacientes.use-case";
import { UserRepository } from "./repositories/UserRepository";
import { PrismaUserRepository } from "src/database/prisma/repositories/PrismaUserRepository";
import { PsicologoRepository } from "./repositories/PsicologoRepository";
import { PrismaPsicologoRepository } from "src/database/prisma/repositories/PrismaPsicologoRepository";
import { PacienteRepository } from "./repositories/PacienteRepository";
import { PrismaPacienteRepository } from "src/database/prisma/repositories/PrismaPacienteRepository";
import { EncryptionService } from "../services/encryptionService";
import { GetPacienteProfileUseCase } from "./useCases/getUserUseCase/getPacienteUseCase";
import { PrismaPacienteMapper } from "src/database/prisma/mappers/PrismaPacienteMapper";
import { PrismaUserMapper } from "src/database/prisma/mappers/PrismaUserMapper";
import { PrismaPsicologoMapper } from "src/database/prisma/mappers/PrismaPsicologoMapper";
import { CreatePacienteUseCase } from "./useCases/createUserUseCase/create-paciente.use-case";
import { GetUserProfileUseCase } from "./useCases/getUserProfileUseCase/get-user-profile.use-case";
import { UpdateUserProfileUseCase } from "./useCases/updateUserProfileUseCase/update-user-profile.use-case";
import { CloudinaryService } from "../services/cloudinaryService";
import { PacienteModule } from "../paciente/paciente.module";

@Module({
    imports: [DatabaseModule,PacienteModule],
    controllers: [UserController],
    providers: [
        CreatePsicologoUseCase,
        CreatePacienteUseCase,
        CreatePacienteWithPsicologoUseCase,
        ListPacientesUseCase,
        EncryptionService,
        CloudinaryService,
        GetPacienteProfileUseCase,
        GetUserProfileUseCase,
        UpdateUserProfileUseCase,
        PrismaPacienteMapper,
        PrismaUserMapper,
        PrismaPsicologoMapper,
        {
            provide: UserRepository,
            useClass: PrismaUserRepository,
        },
        {
            provide: PsicologoRepository,
            useClass: PrismaPsicologoRepository,
        },
        {
            provide: PacienteRepository,
            useClass: PrismaPacienteRepository,
        },
    ],
})
export class UserModule {}