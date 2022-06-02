import { IPaginatedResult, SortDirection } from "shared-types";
import { ACCESS_RESSOURCES } from "shared-types/AccessRessources";
import { PRIVILEGE } from "shared-types/auth/access";

import { RoleType } from "../models/Role";

export type AuthZRouteTypes = {
  "/z/ressource-access": {
    POST: {
      body: {
        ressource: ACCESS_RESSOURCES;
        privileges: PRIVILEGE | PRIVILEGE[];
      };

      response: string;
    };
  };
  "/z/roles": {
    GET: {
      query: {
        page?: string;
        limit?: string;
        sortDirection?: SortDirection;
        sortField?: string;
      };
      response: IPaginatedResult<RoleType>;
    };
  };
  //! GENERATOR-ANCHOR
};
