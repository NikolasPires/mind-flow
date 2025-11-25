import { User } from "../entities/User";
import { UserRepository } from "./UserRepository";

export class UserRepositoryInMemory implements UserRepository {
    public users: User[] = [];

    async create(user: User): Promise<void> {
        this.users.push(user);
    }

   async findByEmailHash(emailHash: string): Promise<User | null> {
        const user = this.users.find(u => u.emailHash === emailHash);
        if (!user) {
            return null;
        }
        return user;
   }
}