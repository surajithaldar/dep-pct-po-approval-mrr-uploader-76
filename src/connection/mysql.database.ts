import * as mysql from 'mysql';
import * as util from 'util';
export class Connection {
  PCTCom() {
    const conn = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_PCT,
    });

    const query = util.promisify(conn.query).bind(conn);
 
    return query;
  }
  poApproval() {
    const conn = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_PO_APPROVAL,
    });

    const query = util.promisify(conn.query).bind(conn);
    return query;
  }
}
