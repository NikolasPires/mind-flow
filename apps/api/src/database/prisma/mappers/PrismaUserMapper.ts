// mappers/PrismaUserMapper.ts

import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from 'generated/prisma';
import { EncryptionService } from 'src/modules/services/encryptionService';
import { AccountStatus, Role, User } from 'src/modules/user/entities/User';

@Injectable()
export class PrismaUserMapper {
  constructor(private encryptionService: EncryptionService) {}

  toPrisma(user: User) {
    return {
      id: user.id,
      name: this.encryptionService.encrypt(user.name),
      email: this.encryptionService.encrypt(user.email),
      phone: user.phone ? this.encryptionService.encrypt(user.phone) : null,
      emailHash: user.emailHash,
      password: user.password,
      role: user.role,
      photo_url: user.photo_url,
      account_status: user.account_status,
    };
  }

  toDomain(raw: PrismaUser): User {
    return new User(
      {
        name: this.encryptionService.decrypt(raw.name),
        email: this.encryptionService.decrypt(raw.email),
        phone: raw.phone ? this.encryptionService.decrypt(raw.phone) : null,
        emailHash: raw.emailHash,
        password: raw.password,
        role: raw.role as Role,
        photo_url: raw.photo_url,
        account_status: raw.account_status as AccountStatus,
        created_at: raw.created_at,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}