import { Role } from '../../common/constants/roles.constant';

export interface User {
  id: number;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
