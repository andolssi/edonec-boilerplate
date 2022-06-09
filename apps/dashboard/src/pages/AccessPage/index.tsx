import Api from "api";
import { LeanRoleDocument } from "auth-types/models/Role";
import ButtonLink from "core-cra-components/ButtonLink";
import UncontrolledDataTable from "core-cra-components/UncontrolledDataTable";
import { FetchFunction } from "core-cra-components/UncontrolledDataTable/types";

import { useInitRoute } from "containers/AppRouter/useInitRoute";

import { useAccessPage } from "./useAccessPage";

const fetchFunction: FetchFunction<LeanRoleDocument> = (args) =>
  Api.authSDK.getRoles({ query: args });

const AccessPage = () => {
  useInitRoute({
    description: "Role management",
    title: "Roles",
    customButton: (
      <ButtonLink to="roles/add" soft primary>
        Add New Role
      </ButtonLink>
    ),
  });
  const { dataColumns } = useAccessPage();

  return (
    <UncontrolledDataTable
      fetchFunction={fetchFunction}
      columns={dataColumns}
      keyExtractor={({ item }) => item._id}
    />
  );
};

export default AccessPage;
