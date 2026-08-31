import type { User } from "./schema";

export class UserEntity {
  constructor(private readonly user: User) {}

  get id(): string {
    return this.user.id;
  }

  get email(): string {
    return this.user.email;
  }

  get firstName(): string {
    return this.user.firstName;
  }
  get lastName(): string {
    return this.user.lastName;
  }

  get fullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  get initials(): string {
    return `${this.user.firstName[0]}${this.user.lastName[0]}`;
  }

  get createdAt(): Date {
    return new Date(this.user.createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.user.updatedAt);
  }
}
