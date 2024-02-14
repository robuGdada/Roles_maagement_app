import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../server";

export type IUserData = {
  username: string;
  password: string;
  role: string;
};

//getUser

export const getAll = async (offset: number, pageSize: number) => {
  console.log("repo bhitra chiryo");
  return await prisma.user.findMany({
    skip: offset,
    take: pageSize,
    select: {
      id: true,
      username: true,
      password: true,
      role: {
        select: {
          id: true,
          roleName: true,

          permissionOnRole: {
            select: {
              permission: true,
              role: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAllWithSearch = async (
  offset: number,
  pageSize: number,
  searchVal: string
) => {
  console.log("getAllwithSearch ko repo ma aayo");
  return await prisma.user.findMany({
    skip: offset,
    take: pageSize,
    where: {
      username: {
        contains: searchVal,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
const getOneUser = async (payload: Prisma.UserWhereUniqueInput) => {
  try {
    return await prisma.user.findFirst({
      where: {
        username: payload.username,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// post | mutation
// export const createUser = async (userData: IUserData) => {
//   const role = await prisma.roles.findFirst({
//     where: { roleName: userData.role },
//   });

//   if (!role) {
//     console.error(`Error: Role not found for ${userData.role}`);
//     throw new Error(`Role not found for ${userData.role}`);
//   }

//   try {
//     const createdUser = await prisma.user.create({
//       data: {
//         ...userData,
//         role: { connect: { id: role.id } },
//       },
//     });

//     console.log(`User created successfully: ${createdUser.username}`);
//     return createdUser;
//   } catch (error) {
//     console.error(`Error creating user: ${error}`);
//     throw new Error(`Error creating user: ${error}`);
//   }
// };

export const userRepo = {
  getAll,
  getAllWithSearch,
  getOneUser,
};
