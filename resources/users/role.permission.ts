import { prisma } from "../../app";

export const permissionRole = async (roleId: number) => {
  if (roleId === 1) {
    const permissionsToGrant = [2, 3];
    await Promise.all(
      permissionsToGrant.map(async (permissionId) => {
        await prisma.permissionOnRole.create({
          data: {
            roleId: roleId,
            permissionId,
          },
        });
      })
    );
  }
};
