/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction, Router } from 'express';
import express from 'express';
import { DataSource } from 'typeorm';
import { AppConfig } from './config/app.config';
import DambaApiDocNested from './common/Damba/v2/route/DambaRouteDoc';
import { ServiceConfig } from './common/Damba/v1/service/ServiceConfig';
import { createBehaviors } from './common/Damba/v2/service/DambaService';
import { DambaRoute } from './common/Damba/v2/route/DambaRoute';
import { IServiceProvider } from './common/Damba/v2/service/IServiceDamba';
import { IAppConfig } from './common/Damba/v1/config/IAppConfig';
import { ServiceRegistry } from './common/Damba/v1/service/ServiceRegistry';
import { DEvent as DambaEvent } from './common/Damba/v2/service/DEvent';
export const DambaServices = (
  _SPS_: IServiceProvider<Request, Response, NextFunction>,
  AppConfig?: IAppConfig<DataSource>,
) => {
  ServiceRegistry._init();
  const root = express.Router();
  const { route, extras } = DambaRoute<Request, Response, NextFunction, Router>(
    { root, express },
    _SPS_,
    AppConfig,
  );
  const { doc } = DambaApiDocNested<Request, Response, NextFunction>(_SPS_, AppConfig);
  return { route, extras, doc };
};

export type DEvent = DambaEvent<Request, Response, NextFunction>;
export const createService = <T>(
  name: string,
  entity?: new (...args: any[]) => any,
  config?: ServiceConfig<Request, Response, NextFunction>,
  fmiddleware?: Array<(de: DEvent) => any>,
) => {
  return createBehaviors<T, Request, Response, NextFunction>(name, entity, config, fmiddleware);
};

export const auth = AppConfig.authoriztion;
