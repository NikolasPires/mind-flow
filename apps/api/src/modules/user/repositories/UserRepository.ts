import { Paciente } from "../entities/Paciente";
import { Psicologo } from "../entities/Psicologo";
import { User } from "../entities/User";

export abstract class UserRepository {
    abstract create(user: User, profile: Psicologo | Paciente): Promise<void>;

    abstract findByEmailHash(email: string): Promise<User | null>;
}