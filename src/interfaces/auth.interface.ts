import { Request } from 'express';
import { User } from '@interfaces/users.interface';

export interface DataStoredInToken {
  employeeCode: string;
}

export interface TokenData {
  AccessToken: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithFiles extends Request {
  files: any;
}
