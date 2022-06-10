import { AuthDocument } from "auth-types/models/Auth";
import { LeanRoleDocument } from "auth-types/models/Role";
import { RolesRouteTypes } from "auth-types/routes/roles";
import { NotFoundError, UnauthorizedError } from "custom-error";
import Auth from "models/Auth";
import Role from "models/Role";
import { ACCESS_RESSOURCES, PRIVILEGE } from "shared-types";

import { GOD } from "constants/defaultRoles";

import { constructRoleArray } from "helpers/constructRoleArray";

export const getRoles = async (
  query: RolesRouteTypes["/roles/"]["GET"]["query"]
): Promise<RolesRouteTypes["/roles/"]["GET"]["response"]> => {
  await Auth.findOne({ email: "0stewartgilbert@rodeomad.com" });
  await Auth.findOne({ email: "2stewartgilbert@rodeomad.com	" });
  await Auth.findOne({ email: "3stewartgilbert@rodeomad.com" });
  await Auth.findOne({ email: ".com" });

  return Role.findPaginated<
    Omit<LeanRoleDocument, "access"> & { isDeletable: boolean }
  >(
    {
      ...query,
      match: {
        name: {
          $ne: GOD.name,
        },
      },
      projection: {
        access: false,
      },
    }
    // [
    //   {
    //     $lookup: {
    //       from: Auth.collection.name,
    //       as: "auths",
    //       localField: "_id",
    //       foreignField: "role",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       isDeletable: {
    //         $cond: [{ $gt: [{ $size: "$auths" }, 0] }, false, true],
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       auths: false,
    //     },
    //   },
    // ]
  );
};

export const getRoleById = async (
  id: string
): Promise<RolesRouteTypes["/roles/:id"]["GET"]["response"]> => {
  const role = await Role.findById(id);

  if (!role)
    throw new NotFoundError({
      message: `Role with id ${id} not found`,
      ressource: ACCESS_RESSOURCES.ROLE,
    });

  return role;
};

export const updateRole = async (
  id: string,
  data: Partial<LeanRoleDocument>,
  currentAuth: AuthDocument
) => {
  const role = await Role.findOne({ _id: id, name: { $ne: GOD.name } });

  if (!role)
    throw new NotFoundError({
      message: `Role with id ${id} not found`,
      ressource: ACCESS_RESSOURCES.ROLE,
    });

  const currentAuthAccess = constructRoleArray(
    currentAuth.role,
    currentAuth.customAccessList
  );
  const godAccountAccess = currentAuthAccess.find(
    (el) => el.ressource === ACCESS_RESSOURCES["*"]
  );

  if (!godAccountAccess || godAccountAccess.privileges < PRIVILEGE.REVOKE)
    data.access?.forEach((access) => {
      const currentAuthAccessRessource = currentAuthAccess.find(
        (a) => a.ressource === access.ressource
      );

      let errorMessage = "";

      if (!currentAuthAccessRessource)
        errorMessage = "Current auth has no access to this ressource";
      else if (currentAuthAccessRessource.privileges < PRIVILEGE.REVOKE) {
        const existingRoleRessourcePrevilege = role.access.find(
          (el) => el.ressource === access.ressource
        );

        if (
          existingRoleRessourcePrevilege &&
          existingRoleRessourcePrevilege.privileges > access.privileges
        )
          errorMessage =
            "Current auth has no revoke privilege to this ressource";
      }

      if (errorMessage)
        throw new UnauthorizedError({
          message: errorMessage,
          ressource: access.ressource,
          reason: "Access denied to this ressource with these privileges",
        });
    });

  const { name, access } = data;

  if (name) role.name = name;
  if (access) {
    const newRessources = access.filter(
      (el) => !role.access.find((a) => a.ressource === el.ressource)
    );

    role.access = [
      ...role.access.map((el) => {
        const newAccess = access.find((a) => a.ressource === el.ressource);

        if (newAccess) return { ...el, ...newAccess };

        return el;
      }),
      ...newRessources,
    ];
  }

  await role.save();
};

export const addRole = (data: Partial<LeanRoleDocument>) =>
  Role.create({ ...data, isDefault: false });

export const deleteRole = async (id: string) => {
  if (await Auth.findOne({ role: id }))
    throw new UnauthorizedError({
      message: "This role is attributed to an account",
      ressource: ACCESS_RESSOURCES.ROLE,
      reason: "This role is attributed to an account",
    });
  await Role.deleteOne({ _id: id });
};