import { PrismaClient, Roles } from "@prisma/client";

export async function roleAndPermission({
  prisma,
  roleFound,
}: {
  prisma: PrismaClient;
  roleFound: Roles;
}) {
  try {
    const existingPermissions = await prisma.permissions.findUnique({
      where: {
        roleId: roleFound.id,
      },
    });
    console.log(
      `Current permissions for role ${roleFound.roleName}:`,
      existingPermissions
    );

    let updateData;

    if (roleFound.roleName === "ADMIN") {
      updateData = { create: true, delete: true, read: true, update: true };
    } else if (roleFound.roleName === "MOD") {
      updateData = { create: true, delete: false, read: true, update: true };
    } else {
      updateData = { create: true, delete: false, read: true, update: false };
    }

    if (existingPermissions) {
      await prisma.permissions.update({
        where: {
          id: existingPermissions.id,
        },
        data: updateData,
      });

      console.log(
        `Permissions updated for role ${roleFound.roleName}:`,
        updateData
      );
    } else {
      const createdPermissions = await prisma.permissions.create({
        data: {
          ...updateData,
          role: {
            connect: { id: roleFound.id },
          },
        },
      });

      console.log(
        `Permissions created for role ${roleFound.roleName}:`,
        createdPermissions
      );
    }

    const updatedPermissions = await prisma.permissions.findUnique({
      where: {
        roleId: roleFound.id,
      },
    });
    console.log(
      `Updated permissions for role ${roleFound.roleName}:`,
      updatedPermissions
    );
  } catch (error) {
    console.error(`Error updating/creating permissions: ${error}`);
  }
}
