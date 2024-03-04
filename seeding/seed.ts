import { Prisma } from "@prisma/client";
import { prisma } from "../app";

const ACTIONS = ["create", "read", "update", "delete"];
type ExcludedResources = "Permission" | "Role" | "permissionOnRole";

const RESOURCES: Exclude<Prisma.ModelName, ExcludedResources>[] = ["Todo"];
export async function seeding() {
  ACTIONS.forEach((action) => {
    RESOURCES.forEach(async (resource) => {
      await prisma.permission.create({
        data: { action, resource },
      });
    });
  });
}
