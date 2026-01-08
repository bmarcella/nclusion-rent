import { IAppConfig } from "./v1/config/IAppConfig";
import "reflect-metadata";
import "tsconfig-paths/register";
/* eslint-disable @typescript-eslint/no-explicit-any */
interface IDambaParamas<DS> {
  datasource: DS;
  _SPS_: any;
  AppConfig: IAppConfig<DS>;
  route: any;
  extras: any;
  doc: any;
  orm: any;
}

export default class DambaApp<DS> {
    
  constructor(params: IDambaParamas<DS>) {
    const app = express();
    app.use(cors(params.AppConfig.cors?.corsOptions));
    app.use(bodyParser.json(params.AppConfig.json));
    app.use(bodyParser.urlencoded(params.AppConfig.urlencoded));
    app.use(session(params.AppConfig.session));

    app.use(
      params.AppConfig.call.helper!<DS>(params.datasource, params.extras)
    );

    if (params.AppConfig.path.docs?.extras)
      app.use(
        params.AppConfig.path.docs?.extras,
        params.AppConfig.call.extrasDoc!(params.extras)
      );

    if (params.AppConfig.path.docs?.api)
      app.use(
        params.AppConfig.path.docs?.api,
        params.AppConfig.call.apiDoc!(params.doc)
      );

    app.use(params.AppConfig.path.basic, params.route);

    const server = app.listen(
      params.AppConfig.port,
      params.AppConfig.call.launch
    );

    process.once(
      "SIGTERM",
      () =>
        void params.AppConfig.call.shutdown!({ server, name: "SIGTERM",   params.orm })
    );
    process.once(
      "SIGINT",
      () =>
        void params.AppConfig.call.shutdown!({ server, name: "SIGINT",   params?.orm })
    );
    process.on("unhandledRejection", (err) => {
      console.error("unhandledRejection", err);
    });

    process.on("uncaughtException", (err) => {
      console.error("uncaughtException", err);
      void   params.AppConfig.call.shutdown!({ server, name: "uncaughtException",   params.orm });
    });
  }
}

export default class Damba {
  public static instance: DambaApp;
  constructor() {}

  public static start<T>(datasource: any) {
    if (!this.instance) {
      this.instance = new DambaApp<T>();
    }
  }
}
