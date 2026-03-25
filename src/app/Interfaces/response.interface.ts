import { UserI } from '../Interfaces/user.interface';

export interface AuthBackendResponse {
  success: boolean;
  data: {
    user: UserI;
    token: string;
  };
  message?: string;
}