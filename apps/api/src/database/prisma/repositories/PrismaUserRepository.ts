// repositories/prisma/PrismaUserRepository.ts

import { Injectable } from "@nestjs/common";
import { User } from "src/modules/user/entities/User";
import { Psicologo } from "src/modules/user/entities/Psicologo";
import { Paciente } from "src/modules/user/entities/Paciente";
import { UserRepository } from "src/modules/user/repositories/UserRepository";
import { PrismaService } from "../prisma.service";
import { PrismaUserMapper } from "../mappers/PrismaUserMapper";
import { EncryptionService } from "src/modules/services/encryptionService";

@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(
        private prisma: PrismaService,
        private userMapper: PrismaUserMapper,
        private encryptionService: EncryptionService
    ) {}

    async create(user: User, profile: Psicologo | Paciente): Promise<void> {
        const userRaw = this.userMapper.toPrisma(user);

        const profilePaciente = profile as Paciente;
        const profilePsicologo = profile as Psicologo;

        await this.prisma.user.create({
            data: {
                ...userRaw,
                psicologo: user.role === 'PSICOLOGO' ? {
                    create: {
                        crp: this.encryptionService.encrypt(profilePsicologo.crp),
                        bio: profilePsicologo.bio, 
                        crpHash: profilePsicologo.crpHash,
                    }
                } : undefined,
                paciente: user.role === 'PACIENTE' ? {
                    create: {
                        cpf: profilePaciente.cpf 
                            ? this.encryptionService.encrypt(profilePaciente.cpf) 
                            : null,
                        gender: profilePaciente.gender,
                        cpfHash: profilePaciente.cpfHash,
                        psicologo_responsavel_id: profilePaciente.psicologo_responsavel_id,
                    }
                } : undefined
            }
        });
    }

    async findByEmailHash(emailHash: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { emailHash }
        });

        if (!user) return null;
        return this.userMapper.toDomain(user);
    }
}