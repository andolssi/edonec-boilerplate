/* eslint-disable unused-imports/no-unused-vars */
import {
  ACCESS,
  ACCESS_RESSOURCES,
  IMiddleware,
  PRIVILEGE,
} from "shared-types";
import { TokenValidator } from "token";

import { Request, Response } from "../types";

export const routeProtection =
  (
    ressource: ACCESS_RESSOURCES,
    privileges: PRIVILEGE
  ): IMiddleware<
    Request<unknown, unknown, unknown, unknown>,
    Response<
      unknown,
      { token: TokenValidator<{ authId: string; access: ACCESS[] }> }
    >
  > =>
  async (_, res, next) => {
    const { token } = res.locals;

    return next();
  };
