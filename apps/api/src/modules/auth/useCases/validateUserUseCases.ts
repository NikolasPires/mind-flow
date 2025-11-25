import { Injectable, UnauthorizedException } from "@nestjs/common";
import { compare } from "bcrypt";
import { createHash } from "crypto";
import { UserRepository } from "src/modules/user/repositories/UserRepository";

interface ValidateUserRequest {
    email: string;
    password: string;
}

@Injectable()
export class ValidateUserUseCase {

    constructor(private userRepository : UserRepository) {}

    async execute({email, password} : ValidateUserRequest) {
        const emailHash = createHash('sha256').update(email).digest('hex');

        const user = await this.userRepository.findByEmailHash(emailHash);
        
        if(!user) throw new UnauthorizedException("Email ou senhas incorretos")
            
        const isPasswordMatched = await compare(password, user.password)

        if(!isPasswordMatched) throw new UnauthorizedException("Email ou senhas incorretos")
        
        return user
    }
}