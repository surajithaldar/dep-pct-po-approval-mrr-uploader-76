import config from 'config';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';

//import AuthService from './../services/auth.service';
import fs from 'fs';
import Redis from 'ioredis';
//import _ from 'lodash';
import RsaModel from '@middlewares/rsa.middleware';
import CryptoModel from '@middlewares/crypto.middleware';
//const objAuth = new AuthService();
const objRSA = new RsaModel();
const objCrypto = new CryptoModel();
const client = new Redis('redis://:EhMCS4Sf@3.143.71.145:6379/1');

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const secretKey: string = config.get('secretKey');
    const publicKey = fs.readFileSync('./keys/publicKey.pem', 'utf8');
    const privateKey = fs.readFileSync('./keys/privateKey.pem', 'utf8');
    // console.log(req);
    const authorization = req.headers['authorization'];
    const AccessToken = authorization.split(' ')[0];
    const RefreshToken = authorization.split(' ')[1];

    //console.log(authorization, AccessToken, RefreshToken);
    // console.log(RefreshToken);

    if (!AccessToken) {
      next(new HttpException(401, 'AccessToken not found'));
    }
    if (!RefreshToken) {
      next(new HttpException(401, 'AccessToken not found'));
    }

    const getRefreshToken = RefreshToken.split('.');
    const getAccessToken = AccessToken.split('.');
    /**
     * Split User encrypted string
     */
    const userEncryptedData = getRefreshToken[getRefreshToken.length - 1];
    /**
     * Decrypt User privater user details
     */
    const userDecryptData = await objRSA.privateDecrypt(privateKey, userEncryptedData, secretKey);
    const UserJsonData = JSON.parse(JSON.parse(userDecryptData));
    /**
     * Decrypt User final details
     */
    const email = await objCrypto.decryptAES256cbc(UserJsonData);
    if (AccessToken && RefreshToken) {
      const storeData: any = await client.get(`api:PoApprovalWebAPI:${email}`);
      if (storeData) {
        const userDetails: any = JSON.parse(storeData);

        let rToken = ``;
        let rCount = 1;

        const rfr = getRefreshToken.slice(0, -1);
        for await (const vaRToken of rfr) {
          rToken += vaRToken;
          if (rCount < rfr.length) {
            rToken += '.';
          }
          rCount++;
        }
        /**
         *
         */
        let aToken = ``;
        let aCount = 1;

        const ath = getAccessToken.slice(0, -1);
        for await (const vaAToken of ath) {
          aToken += vaAToken;
          if (aCount < ath.length) {
            aToken += '.';
          }
          aCount++;
        }
        if (rToken !== userDetails.RefreshToken) {
          next(new HttpException(401, 'please login'));
        }
        const verificationResponse = (await jwt.verify(aToken, publicKey)) as DataStoredInToken;
        if (verificationResponse && userDetails && userDetails.User) {
          req.session.user = userDetails.User;
          next();
        } else {
          next(new HttpException(401, 'Wrong authentication token [1001] '));
        }
      } else {
        next(new HttpException(404, 'Authentication token missing'));
      }
    }
  } catch (error) {
    console.log(error);
    next(new HttpException(401, 'Wrong authentication token [1002]'));
  }
};

export default authMiddleware;
