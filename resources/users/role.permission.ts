import { PrismaClient, Roles } from "@prisma/client";

export async function roleAndPermission({
  prisma,
  roleFound,
}: {
  prisma: PrismaClient;
  roleFound: Roles;
}) {
  const permissions = await prisma.permissions.findUnique({
    where: {
      roleId: roleFound.id,
    },
  });

  if (permissions) {
    let updateData;

    if (roleFound.roleName === "ADMIN") {
      updateData = { create: true, delete: true, read: true, update: true };
    } else if (roleFound.roleName === "MOD") {
      updateData = { create: true, delete: false, read: true, update: true };
    } else {
      updateData = { create: true, delete: false, read: true, update: false };
    }

    await prisma.permissions.update({
      where: {
        id: permissions.id,
      },
      data: updateData,
    });
  } else {
    console.error(`Permissions not found for role: ${roleFound.roleName}`);
  }
}
