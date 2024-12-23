import * as otpGenerator from 'otp-generator';

class OTPModel {
  public async generateOTP(otpLength: any, option: any) {
    try {
      return await otpGenerator.generate(otpLength, option);
    } catch (error) {
      return error;
    }
  }
}
export default OTPModel;
