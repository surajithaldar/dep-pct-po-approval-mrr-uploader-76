import fs from 'fs';

import config from 'config';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import { Connection } from '../connection/mysql.database';

import { UserVerification } from '@dtos/users.dto';

import { HttpException } from '@exceptions/HttpException';
/**
 * Interface
 */
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
/**
 * Middleware
 */

import RsaModel from '@middlewares/rsa.middleware';
import CryptoModel from '@middlewares/crypto.middleware';

import Redis from 'ioredis';

class AuthService {
  public connect: Connection = new Connection();
  public objRsa: RsaModel = new RsaModel();
  public objCrypto: CryptoModel = new CryptoModel();

  public dbPCTCom: any;
  public client: any;

  constructor() {
    this.dbPCTCom = this.connect.PCTCom();
    this.client = new Redis('redis://:EhMCS4Sf@3.143.71.145:6379/1');
  }

  public async login(userData: UserVerification): Promise<{ expiresIn: any; AccessToken: any; RefreshToken: any; user: any }> {
    console.log('login');
    if (_.isEmpty(userData)) throw new HttpException(401, 'Email id is required');

    if (userData.email !== 'surajit.haldar@paharpur.com') {
      throw new HttpException(403, `You are not authorized`);
    } else {
      if (userData.password !== '&r8PB%asq@oJ*7zgA#Jdy8dMjbQhL9^f*F2o6feU&M#^9Qma&b') {
        throw new HttpException(403, `You are not authorized`);
      }
    }
    const user = {
      employeeCode: '03290',
      userName: 'Surajit Haldar',
      officeEmail: 'surajit.haldar@paharpur.com',
    };

    const dataStoredInToken: DataStoredInToken = {
      employeeCode: user.employeeCode,
    };

    const expiresIn: number = 60 * 60 * 24;
    const secretKey: string = config.get('secretKey');
    const privateKey = fs.readFileSync('./keys/privateKey.pem', 'utf8');
    const publicKey = fs.readFileSync('./keys/publicKey.pem', 'utf8');

    const i = user.userName;
    const s = user.officeEmail;
    const a = 'https://www.poapproval.paharpur.co.in';

    // Token signing options
    const signOptionsForAccessToken: any = {
      issuer: i,
      subject: s,
      audience: a,
      expiresIn: '2 days',
      algorithm: 'RS256',
    };

    const signOptionsForRefreshTokenToken: any = {
      issuer: i,
      subject: s,
      audience: a,
      expiresIn: '2 days',
      algorithm: 'RS256',
    };
    const rawAccessToken = jwt.sign(dataStoredInToken, { key: privateKey.toString(), passphrase: secretKey }, signOptionsForAccessToken);
    const rawRefreshToken = jwt.sign(dataStoredInToken, { key: privateKey.toString(), passphrase: secretKey }, signOptionsForRefreshTokenToken);

    const genToken: string = user.officeEmail;
    const AccessToken =
      rawAccessToken + '.' + (await this.objRsa.publicEncrypt(publicKey, JSON.stringify(await this.objCrypto.encryptAES256cbc(genToken))));
    const RefreshToken =
      rawRefreshToken + '.' + (await this.objRsa.publicEncrypt(publicKey, JSON.stringify(await this.objCrypto.encryptAES256cbc(genToken))));

    const dStoreKey = `api:PoApprovalWebAPI:${user.officeEmail}`;
    const token: any = {
      AccessToken: rawRefreshToken,
      RefreshToken: rawRefreshToken,
      User: user,
    };
    this.client.set(dStoreKey, JSON.stringify(token));
    this.client.expire(dStoreKey, 60 * 60 * 24);
    this.createCookie({ expiresIn, AccessToken, RefreshToken });

    return { expiresIn, AccessToken, RefreshToken, user };
  }

  /**
   *
   * @param userData
   * @returns
   */

  public async logout(userData: User, requestData: any): Promise<any> {
    if (_.isEmpty(userData)) throw new HttpException(400, "You're not ");
    const findUser = [];
    if (!findUser) throw new HttpException(409, "You're not user");
    return findUser;
  }
  /**
   *
   * @param user
   * @returns
   */

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { employeeCode: user.employeeCode };
    const secretKey: string = config.get('secretKey');
    const expiresIn = 1;

    return { expiresIn, AccessToken: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }
  /**
   *
   * @param tokenData
   * @returns
   */

  public createCookie(tokenData: any): string {
    return `Authorization=${tokenData.AccessToken} ${tokenData.RefreshToken}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
