import { UserI } from '../Interfaces/user.interface';

export interface ResponseAuth {
  success: boolean;
  data: {
    user: UserI;
    token: string;
  };
  message?: string;
}
