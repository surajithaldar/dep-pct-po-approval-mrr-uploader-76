import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class UserOTPRequest {
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  public password: string;
}

export class UserVerification {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  public password: string;
 
}

export class UserLogout {
  @IsNotEmpty()
  @IsString()
  public application_id: string;
}
