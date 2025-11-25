import { Injectable, ConflictException } from "@nestjs/common";
import { hash } from "bcrypt";
import { Role, User } from "../../entities/User";
import { Psicologo } from "../../entities/Psicologo";
import { UserRepository } from "../../repositories/UserRepository";
import { PsicologoRepository } from "../../repositories/PsicologoRepository";
import { createHash } from "crypto";

interface CreatePsicologoRequest {
    email: string;
    name: string;
    password: string;
    crp: string;
}

@Injectable()
export class CreatePsicologoUseCase {
    constructor(
        private userRepository: UserRepository,
        private psicologoRepository: PsicologoRepository,
    ) {}

    async execute({ email, name, password, crp }: CreatePsicologoRequest): Promise<User> {

        const emailHash = createHash('sha256').update(email).digest('hex');
        const crpHash = createHash('sha256').update(crp).digest('hex');

        const userWithSameEmail = await this.userRepository.findByEmailHash(emailHash);
        
        if (userWithSameEmail) {
            throw new ConflictException("Este endereço de email já está em uso.");
        }
        
        const psicologoWithSameCrp = await this.psicologoRepository.findByCrpHash(crpHash);
        if (psicologoWithSameCrp) {
            throw new ConflictException("Este CRP já está cadastrado.");
        }

        const user = new User({
            email,
            emailHash: emailHash,
            name,
            password: await hash(password, 10),
            role: Role.PSICOLOGO,
        });

        const psicologo = new Psicologo({
            userId: user.id,
            crp,
            crpHash: crpHash,
        });

        await this.userRepository.create(user, psicologo);

        return user;
    }
}