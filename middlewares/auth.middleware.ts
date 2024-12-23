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

    const Authorization = req.cookies['Authorization'];
    const RefreshToken = req.cookies['RefreshToken'];

    if (!Authorization) {
      next(new HttpException(401, 'AccessToken not found'));
    }
    if (!RefreshToken) {
      next(new HttpException(401, 'AccessToken not found'));
    }

    const getRefreshToken = RefreshToken.split('.');
    const getAuthorization = Authorization.split('.');
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

    if (Authorization && RefreshToken) {
      const storeData: any = await client.get(`aws:po-approval:${email}`);
      if (storeData) {
        const userDetails: any = JSON.parse(storeData);

        // const i = userDetails.userName; // Issuer (Software organization who issues the token)
        // const s = userDetails.officeEmail; // Subject (intended user of the token)
        // const a = 'https://www.poapproval.paharpur.co.in'; // Audience (Domain within which this token will live and function)

        // Token signing options
        // const verifyOptionsRefreshToken: any = {
        //   issuer: i,
        //   subject: s,
        //   audience: a,
        //   expiresIn: '2 days',
        //   algorithm: ['RS256'],
        // };

        // const verifyOptionsAuthToken: any = {
        //   issuer: i,
        //   subject: s,
        //   audience: a,
        //   expiresIn: '60',
        //   algorithm: ['RS256'],
        // };

        /**
         *
         */

        // const rToken = getRefreshToken.slice(0, -1)
        // const AToken = getAuthorization.slice(0, -1)
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

        const ath = getAuthorization.slice(0, -1);
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
        /**
         *
         */
        // var legit = jwt.verify(rToken, publicKey, verifyOptionsRefreshToken);
        // var decoded = jwt.decode(rToken, { complete: true });

        //     console.log(legit)

        //     if (legit) {
        //       req.user = userDetails
        //       next();

        //     } else {
        //       next(new HttpException(401, 'Wrong authentication token [1001] '));
        //     }

        //   } else {
        //     next(new HttpException(401, 'Invalid User'));
        //   }

        const verificationResponse = (await jwt.verify(aToken, publicKey)) as DataStoredInToken;

        // console.log(verificationResponse)

        // const employeeCode = verificationResponse.employeeCode
        // const findUser = await objAuth.getUserDetailsUsingEmployeeCode(verificationResponse);
        // console.log(findUser)
        if (verificationResponse && userDetails && userDetails.User) {
          //  if (false) {
          req.session.user = userDetails.User;
          next();
        } else {
          // const legit = await jwt.verify(rToken, publicKey, verifyOptionsRefreshToken);
          // const decoded = jwt.decode(rToken, { complete: true });
          // if (decoded.payload.sub === userDetails.User.officeEmail
          //   && decoded.payload.employeeCode === userDetails.User.employeeCode) {

          //     const reqForRefreshToken:any ={
          //       email: userDetails.User.officeEmail,
          //       appId:userDetails.User.appId
          //     }

          //    const result =await objAuth.login(reqForRefreshToken);

          // } else {
          //   next(new HttpException(401, 'Wrong authentication token'));
          // }

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
