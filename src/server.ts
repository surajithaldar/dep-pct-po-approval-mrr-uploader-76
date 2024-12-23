process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import 'dotenv/config';

import App from './app';
/**
 * Routes
 */

import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import PurchaseActualReceiptsRoute from '@/routes/purchaseactualreceipts.route';

import validateEnv from '@utils/validateEnv';
import moment from 'moment-timezone';

moment.tz.add('Asia/Calcutta|HMT BURT IST IST|-5R.k -6u -5u -6u|01232|-18LFR.k 1unn.k HB0 7zX0');
moment.tz.link('Asia/Calcutta|Asia/Kolkata');

validateEnv();
const app = new App([new IndexRoute(), new AuthRoute(), new PurchaseActualReceiptsRoute()]);

app.listen();
