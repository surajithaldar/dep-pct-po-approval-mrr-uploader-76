import { Connection } from '../connection/mysql.database';
import _ from 'lodash';
import * as AWS from 'aws-sdk';
import { HttpException } from '@exceptions/HttpException';
import Redis from 'ioredis';
/**
 *
 */
AWS.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
  region: 'ap-south-1',
});

const s3 = new AWS.S3();
class PurchaseActualReceiptsService {
  public connect: Connection = new Connection();
  public dbPCTCom: any;
  public poApproval: any;
  public client: any;
  constructor() {
    this.dbPCTCom = this.connect.PCTCom();
    this.poApproval = this.connect.poApproval();
    this.client = new Redis('redis://:EhMCS4Sf@3.143.71.145:6379/1');
  }

  public async getAllPOs(): Promise<any> {
    try {
      const result = await this.poApproval(
        `
        SELECT  po_number   FROM purchase_order where substring(po_number,3,3)  in ('HHE','HHF','HIM')  group by po_number
        `,
      );
      return result;
    } catch (error) {
      throw new HttpException(409, JSON.stringify(error));
    }
  }
  public async getAllPOsForActualReceipt(): Promise<any> {
    try {
      const day = new Date().getDate();
      let limit: any = {
        min: 0,
        max: 200,
        day,
      };
      const dStoreKey = `po:day`;
      const storeData: any = await this.client.get(dStoreKey);
      if (storeData) {
        const data: any = JSON.parse(storeData);

        const min = parseInt(data.max) + 1;
        const max = min + 100;
        const sday = data.day;

        if (day == sday) {
          limit = {
            min,
            max,
            day,
          };
        }
      }
      console.log(limit);
      this.client.set(dStoreKey, JSON.stringify(limit));
      const result = await this.poApproval(
        `
        SELECT  po_number   FROM purchase_order where  po_number not in(select t_orno from purchase_actual_receipts where DATE_FORMAT(t_updt,'%Y-%m-%d') =DATE_FORMAT(now(),'%Y-%m-%d') ) and substring(po_number,1,2)>'22' group by po_number order by po_number limit ${limit.min},${limit.max}
        `,
      );

      return result;
    } catch (error) {
      throw new HttpException(409, JSON.stringify(error));
    }
  }
  public async updateActualReceipt(body: any): Promise<any> {
    try {
      console.log(body);
      for (const value of body.data) {
        const result = await this.poApproval(
          `
       INSERT INTO purchase_actual_receipts (
        t_orno,
        t_pono,
        t_sqnb,
        t_rcld,
        t_rcno,
        t_rseq,
        t_dino,
        t_qiap,
        t_damt,
        t_einv_l,
        t_invd_l,
        t_item,
        t_qoor,
        t_cuqp,
        t_pric,
        t_cupp,
        t_key,
        t_mrr
        ) VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        ) 
        `,
          [
            value.t_orno,
            value.t_pono,
            value.t_sqnb,
            value.t_rcld,
            value.t_rcno,
            value.t_rseq,
            value.t_dino,
            value.t_qiap,
            value.t_damt,
            value.t_einv_l,
            value.t_invd_l,
            value.t_item,
            value.t_qoor,
            value.t_cuqp,
            value.t_pric,
            value.t_cupp,
            value.t_orno + value.t_pono + value.t_sqnb,
            ['V2PRJ', 'PRJWH', 'WHBOM'].includes(value.t_cwar) ? 'false' : 'true',
          ],
        );
        console.log(result);
      }

      return [];
    } catch (error) {
      // throw new HttpException(409, JSON.stringify(error));
    }
  }
  public async GetReceiptNo(): Promise<any> {
    try {
      const result = await this.poApproval(
        `SELECT  t_rcno  FROM purchase_actual_receipts where t_mrr ='true' and t_ispay='false' group by t_rcno limit 50`,
      );
      return result;
    } catch (error) {
      throw new HttpException(409, JSON.stringify(error));
    }
  }
  public async savePaymentDetails(body: any): Promise<any> {
    try {
      let affectedRows = 0;
      for (const value of body.data) {
        const result = await this.poApproval(
          `
         INSERT INTO payment_against_requisition (
                t_rcno,
                t_nama,
                t_ardt,
                t_cwar,
                t_sfbp,
                t_ityp,
                t_idoc,
                t_orno,
                t_pono,
                t_amth_1,
                t_paym,
                t_balh_1,
                t_tpay,
                t_cpay,
                t_last_updated_date
                )
         VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
          `,
          [
            value.t_rcno,
            value.t_nama,
            value.t_ardt,
            value.t_cwar,
            value.t_sfbp,
            value.t_ityp,
            value.t_idoc,
            value.t_orno,
            value.t_pono,
            value.t_amth_1,
            value.payment,
            value.t_balh_1,
            value.t_tpay,
            value.t_cpay,
            new Date(),
          ],
        );

        if (result.affectedRows > 0) {
          affectedRows++;
        }
      }

      return affectedRows;
    } catch (error) {
      // throw new HttpException(409, JSON.stringify(error));
    }
  }
  /** */
  public async GetPendingPayment(): Promise<any> {
    try {
      const result = await this.poApproval(
        `  SELECT  concat(t_orno,t_pono,t_rcno) as op  FROM payment_against_requisition where t_amth_1-t_paym !=0  AND DATEDIFF(now(),t_last_updated_date) >=1  ORDER BY t_orno,t_pono,t_rcno limit 100`,
      );

      if (result.length > 0) {
        let inString = '';
        let count = 1;

        for (const dtl of result) {
          inString += `'${dtl.op}'`;
          if (count < result.length) {
            inString += `,`;
          }
          count++;
        }
        console.log(inString);
        await this.poApproval(
          `UPDATE    payment_against_requisition  set t_last_updated_date=now() where concat(t_orno,t_pono,t_rcno) in(${inString})`,
        );
      }
      return result;
    } catch (error) {
      throw new HttpException(409, JSON.stringify(error));
    }
  }

  public async UpdatePaymentDetails(body: any): Promise<any> {
    try {
      let affectedRows = 0;
      for (const value of body.data) {
        const result = await this.poApproval(
          `
         UPDATE  payment_against_requisition set
                 
    
                t_paym=?,
                t_balh_1=? 
                WHERE t_orno =?
                AND  t_pono =?
                AND t_rcno=?
            
          `,
          [value.payment, value.t_balh_1, value.t_orno, value.t_pono, value.t_rcno],
        );

        if (result.affectedRows > 0) {
          affectedRows++;
        }
      }

      return affectedRows;
    } catch (error) {
      // throw new HttpException(409, JSON.stringify(error));
    }
  }
  /** */

  /** *********************************************************************************************************************************/
  public async savePOA120(body: any): Promise<any> {
    try {
      let affectedRows = 0;
      const insVal: any = [];
      for (const value of body.data) {
        const result = await this.poApproval(
          `
          INSERT INTO ttpptc120poa(
                t_cprj,
                t_cspa,
                t_sern,
                t_cact,
                t_item,
                t_quan,
                t_cuni,
                t_pric,
                t_lcta
                  ) VALUES (?,?,?,?,?,?,?,?,?)
          `,
          [value.t_cprj, value.t_cspa, value.t_sern, value.t_cact, value.t_item, value.t_quan, value.t_cuni, value.t_pric, value.t_lcta],
        );
        if (result.affectedRows > 0) {
          affectedRows++;
          insVal.push({
            t_cprj: value.t_cprj,
            t_cspa: value.t_cspa,
            t_sern: value.t_sern,
            t_cact: value.t_cact,
            t_item: value.t_item,
            t_quan: value.t_quan,
            t_cuni: value.t_cuni,
            t_pric: value.t_pric,
            t_lcta: value.t_lcta,
          });
        }
      }

      return { affectedRows };
    } catch (error) {
      console.log(error);
      // throw new HttpException(409, JSON.stringify(error));
    }
  }

  public async ttdpur113poa(body: any): Promise<any> {
    try {
      let affectedRows = 0;
      const insVal: any = [];
      for (const value of body.data) {
        const _delete = await this.poApproval(`  DELETE FROM ttdpur113poa where  t_cprj =?, t_cspa=?,  t_orno=?, t_pono=? `, [
          value.t_cprj,
          value.t_cspa,

          value.t_orno,
          value.t_pono,
        ]);
        const result = await this.poApproval(
          `
          INSERT INTO ttdpur113poa(
            t_cprj, t_cspa, t_sern, t_orno, t_pono, t_oamt
                  ) VALUES (?,?,?,?,?,?)
          `,
          [value.t_cprj, value.t_cspa, value.t_sern, value.t_orno, value.t_pono, value.t_oamt],
        );
        if (result.affectedRows > 0) {
          affectedRows++;
          insVal.push({
            t_cprj: value.t_cprj,
            t_cspa: value.t_cspa,
            t_sern: value.t_sern,
            t_orno: value.t_orno,
            t_pono: value.t_pono,
            t_oamt: value.t_oamt,
          });
        }
      }

      return { affectedRows };
    } catch (error) {
      console.log(error);
      // throw new HttpException(409, JSON.stringify(error));
    }
  }
}

export default PurchaseActualReceiptsService;
