import { Role } from "@prisma/client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
}
