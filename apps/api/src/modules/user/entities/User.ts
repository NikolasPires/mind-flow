import { randomUUID } from "crypto";
import { Replace } from "src/utils/Replace";

export enum Role {
  PSICOLOGO = 'PSICOLOGO',
  PACIENTE = 'PACIENTE',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

interface UserSchema {
  name: string;
  email: string;
  emailHash: string | null;
  password: string;
  role: Role;
  phone: string | null;
  photo_url: string | null;
  account_status: AccountStatus;
  created_at: Date;
  updatedAt: Date;
}

export class User {
  private props: UserSchema;
  private _id: string;

  constructor(
    props: Replace<
      UserSchema,
      { 
        created_at?: Date,
        updatedAt?: Date,
        account_status?: AccountStatus,
        phone?: string | null,
        photo_url?: string | null,
      }
    >, 
    id?: string
  ) {
    this.props = {
      ...props,
      phone: props.phone ?? null,
      photo_url: props.photo_url ?? null,
      account_status: props.account_status ?? AccountStatus.ACTIVE,
      created_at: props.created_at ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }
    this._id = id || randomUUID();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  get id(): string { return this._id; }

  get name(): string { return this.props.name; }
  set name(name: string) { this.props.name = name; this.touch(); }

  get email(): string { return this.props.email; }
  set email(email: string) { this.props.email = email; this.touch(); }

  get emailHash(): string | null { return this.props.emailHash; }
  set emailHash(hash: string) { this.props.emailHash = hash; this.touch(); }

  get password(): string { return this.props.password; }
  set password(password: string) { this.props.password = password; this.touch(); }
  
  get role(): Role { return this.props.role; }
  set role(role: Role) { this.props.role = role; this.touch(); }

  get phone(): string | null { return this.props.phone; }
  set phone(phone: string | null) { this.props.phone = phone; this.touch(); }

  get photo_url(): string | null { return this.props.photo_url; }
  set photo_url(photo_url: string | null) { this.props.photo_url = photo_url; this.touch(); }
  
  get account_status(): AccountStatus { return this.props.account_status; }
  set account_status(status: AccountStatus) { this.props.account_status = status; this.touch(); }

  get created_at(): Date { return this.props.created_at; }
  get updatedAt(): Date { return this.props.updatedAt; }
}