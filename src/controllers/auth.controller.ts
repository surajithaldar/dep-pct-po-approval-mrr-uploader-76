import { NextFunction, Request, Response } from 'express';
import { UserVerification, UserLogout } from '@dtos/users.dto';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';

class AuthController {
  public authService = new AuthService();

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: UserVerification = req.body;
      const { expiresIn, AccessToken, RefreshToken, user } = await this.authService.login(userData);
      res.setHeader('Set-Cookie', [`Authorization=${AccessToken} ${RefreshToken}; Max-age=${expiresIn}`]);
      res.status(200).json({
        oauthToken: {
          expiresIn,
          AccessToken,
          RefreshToken,
        },
        user,
        message: 'login',
        status: true,
      });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const requestData: UserLogout = req.body;
      const logOutUserData: User = await this.authService.logout(userData, requestData);
      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: logOutUserData, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
