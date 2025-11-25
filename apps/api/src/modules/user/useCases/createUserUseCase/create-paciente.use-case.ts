import { Injectable, ConflictException } from "@nestjs/common";
import { hash } from "bcrypt";
import { Role, User } from "../../entities/User";
import { Gender, Paciente } from "../../entities/Paciente";
import { UserRepository } from "../../repositories/UserRepository";
import { PacienteRepository } from "../../repositories/PacienteRepository";
import { createHash } from 'crypto'; 
import { EncryptionService } from "src/modules/services/encryptionService";

interface CreatePacienteRequest {
    email: string;
    name: string;
    password: string;
    cpf: string;
    gender: Gender;
    phone?: string; // --- ALTERAÇÃO 1: Adicionado na interface
}

@Injectable()
export class CreatePacienteUseCase {
    constructor(
        private userRepository: UserRepository,
        private pacienteRepository: PacienteRepository,
        private encryptionService: EncryptionService,
    ) {}

    // --- ALTERAÇÃO 2: Recebendo 'phone' nos argumentos
    async execute({ email, name, password, cpf, gender, phone }: CreatePacienteRequest): Promise<User> {
        const cpfHash = createHash('sha256').update(cpf).digest('hex');
        const emailHash = createHash('sha256').update(email).digest('hex');
        
        const userWithSameEmail = await this.userRepository.findByEmailHash(emailHash);
        if (userWithSameEmail) {
            throw new ConflictException("Este endereço de email já está em uso.");
        }
        
        const pacienteWithSameCpf = await this.pacienteRepository.findByCpfHash(cpfHash); 
        
        if (pacienteWithSameCpf) {
            throw new ConflictException("Este CPF já está cadastrado.");
        }

        const user = new User({
            email,
            emailHash,
            name,
            password: await hash(password, 10),
            role: Role.PACIENTE,
            phone: phone, // --- ALTERAÇÃO 3: Passando para a entidade User
        });

        const encryptedCpf = this.encryptionService.encrypt(cpf);

        const paciente = new Paciente({
            userId: user.id,
            cpf: encryptedCpf,
            cpfHash: cpfHash,
            gender,
        });

        await this.userRepository.create(user, paciente);

        return user;
    }
}