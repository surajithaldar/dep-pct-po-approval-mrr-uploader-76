import * as nodemailer from 'nodemailer';
import _ from 'lodash';
import { HttpException } from '@exceptions/HttpException';

class EmailModel {
  public to: any;
  public cc: any;
  public bcc: any;
  public subject: any;
  public html: any;
  public user: any;
  public pass: any;

  constructor(to: any, cc: any, bcc: any, subject: any, html: any) {
    if (_.isEmpty(subject) || _.isUndefined(subject)) throw new HttpException(400, 'Subject is required');
    if (_.isEmpty(html) || _.isUndefined(html)) throw new HttpException(400, 'Html body is required');
    if (_.isEmpty(to) || _.isUndefined(to)) throw new HttpException(400, 'To email is required');

    this.to = to;
    this.cc = cc;
    this.bcc = bcc;
    this.subject = subject;
    this.html = html;
    this.user = 'pctccu@paharpur.com';
    this.pass = 'Pctl1725';
  }

  public async sendAsync() {
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com', // Office 365 server
      port: 587, // secure SMTP
      secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
      auth: {
        user: this.user,
        pass: this.pass,
      },
      tls: {
        ciphers: 'SSLv3',
      },
      //connectionTimeout: 10 * 60 * 1000,
    });

    const info = await transporter.sendMail({
      from: this.user, // sender address
      to: this.to, // list of receivers
      cc: this.cc || [],
      bcc: this.bcc || [],
      subject: this.subject, // Subject line
      html: this.html, // html body
    });
    return info.messageId;
  }
  /**
   *
   */
  public async send() {
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com', // Office 365 server
      port: 587, // secure SMTP
      secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
      auth: {
        user: this.user,
        pass: this.pass,
      },
      tls: {
        ciphers: 'SSLv3',
      },
      //connectionTimeout: 10 * 60 * 1000,
    });

    transporter.sendMail(
      {
        from: this.user, // sender address
        to: this.to, // list of receivers
        cc: this.cc || [],
        bcc: this.bcc || [],
        subject: this.subject, // Subject line
        html: this.html, // html body
      },
      (error, info) => {
        if (error) {
          return console.log(error);
        }
        return info.messageId;
      },
    );
  }
}
export default EmailModel;
