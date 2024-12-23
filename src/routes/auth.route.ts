import { Router } from 'express';

import AuthController from '@controllers/auth.controller';
import { UserVerification } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

class AuthRoute implements Routes {
  public path = '/auth/';
  public router = Router();
  public authController = new AuthController();

  public conRedis: any;
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    //console.log(`${this.path}login`);
    this.router.post(`${this.path}login`, validationMiddleware(UserVerification, 'body'), this.authController.logIn);
  }
}

export default AuthRoute;
