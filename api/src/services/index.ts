
import { IServiceProvider } from '../common/Damba/v2/service/IServiceDamba';
import _Mail from './Mail/behaviors';
import _Otp from  './Otp/behaviors';
import { NextFunction, Request, Response } from 'express';

export const _SPS_: IServiceProvider<Request, Response, NextFunction> = {
  ..._Mail,
  ..._Otp,
};
