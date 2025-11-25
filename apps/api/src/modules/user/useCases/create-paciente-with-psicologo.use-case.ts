import { Injectable, ConflictException, ForbiddenException } from "@nestjs/common";
import { hash } from "bcrypt";
import { Role, User } from "../entities/User";
import { Gender, Paciente } from "../entities/Paciente";
import { UserRepository } from "../repositories/UserRepository";
import { PacienteRepository } from "../repositories/PacienteRepository";
import { PrismaService } from "src/database/prisma/prisma.service";
import { createHash } from 'crypto';

// 1. ADICIONADO: phone opcional na interface
interface CreatePacienteWithPsicologoRequest {
    email: string;
    name: string;
    password: string;
    cpf: string;
    gender: Gender;
    psicologoId: string;
    phone?: string; 
}

@Injectable()
export class CreatePacienteWithPsicologoUseCase {
    constructor(
        private userRepository: UserRepository,
        private pacienteRepository: PacienteRepository,
        private prisma: PrismaService,
    ) {}

    // 2. ADICIONADO: phone na desestruturação dos parâmetros
    async execute({ email, name, password, cpf, gender, psicologoId, phone }: CreatePacienteWithPsicologoRequest): Promise<User> {
        const psicologo = await this.prisma.psicologo.findUnique({
            where: { userId: psicologoId },
        });

        if (!psicologo) {
            throw new ForbiddenException("Usuário não é um psicólogo ou não foi encontrado.");
        }

        const emailHash = createHash('sha256').update(email).digest('hex');
        const userWithSameEmail = await this.userRepository.findByEmailHash(emailHash);
        if (userWithSameEmail) {
            throw new ConflictException("Este endereço de email já está em uso.");
        }

        const cpfHash = createHash('sha256').update(cpf).digest('hex');
       
        const pacienteWithSameCpf = await this.pacienteRepository.findByCpfHash(cpfHash); 

        if (pacienteWithSameCpf) {
            throw new ConflictException("Este CPF já está cadastrado.");
        }

        const user = new User({
            email,
            emailHash: emailHash,
            name,
            password: await hash(password, 10),
            role: Role.PACIENTE,
            phone: phone, // 3. ADICIONADO: Passando o telefone para a entidade User
        });

        const paciente = new Paciente({
            userId: user.id,
            cpf, // Nota: Neste arquivo você não está usando a criptografia (EncryptionService) como no outro. Se precisar, lembre-se de importar.
            gender,
            cpfHash: cpfHash,
            psicologo_responsavel_id: psicologoId,
        });
        
        await this.userRepository.create(user, paciente);

        return user;
    }
}