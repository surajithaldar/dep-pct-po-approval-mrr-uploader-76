process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';
import session from 'express-session';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from 'config';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import fileUpload from 'express-fileupload';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';
// import path from 'path';

declare module 'express-session' {
  interface Session {
    user: any;
  }
}
const RedisStore = connectRedis(session);
const client = new Redis('redis://:EhMCS4Sf@3.143.71.145:6379/1');

class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor(routes: Routes[]) {
    // type UploadedFile = fileUpload.UploadedFile;
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    //this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`App listening on the port ${this.port}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    // console.log(path.join(__dirname, 'keys'))

    // this.app.use( express.static(path.join(__dirname, 'keys')))
    this.app.use(morgan(config.get('log.format'), { stream }));

    this.app.use(cors({ credentials: true, origin: true }));
    this.app.use(hpp());
    //this.app.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());

    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
      }),
    );
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(
      session({
        secret: '&n{h6x<6jY:A%=Ch',
        store: new RedisStore({ prefix: 'aws:po-approval:poApprovalApi:', host: 'localhost', port: 6379, client: client, ttl: 60 * 60 }),
        saveUninitialized: false,
        resave: false,
        unset: 'destroy',
      }),
    );

    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
