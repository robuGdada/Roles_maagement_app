import { Request, Response } from "express";
import { userRepo } from "./user.repo";
import { PrismaClient, UserRole } from "@prisma/client";
import { roleAndPermission } from "./role.permission";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const getAll = async (req: Request, res: Response) => {
  const currentPage = Number(req.query.page) || 1;
  const pageSize = Number(req.query.page_size) || 10;
  const offset = pageSize * (currentPage - 1);
  const searchVal = req.query.q;
  console.log("controller bhitra chiryo", { searchVal });
  try {
    if (!searchVal) {
      const users = await userRepo.getAll(offset, pageSize);
      // console.log("search val chaina", { users });
      return res.json(users);
    } else {
      const users = await userRepo.getAllWithSearch(
        offset,
        pageSize,
        String(searchVal)
      );
      return res.json(users);
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ e });
  }
};

//createUser

// const createUser = async (req: Request, res: Response) => {
//   const { username, password, role } = req.body;
//   const userData = { username, password, role };
//   console.log({ userData });
//   try {
//     const existingUser = await prisma.user.findFirst({
//       where: { username },
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         errorType: "User_already_exists",
//         message: "User already exists",
//       });
//     }

//     const roleToFind = role as UserRole;
//     console.log("Role to Find:", roleToFind);

//     let roleFound = await prisma.roles.findFirst({
//       where: { roleName: roleToFind },
//     });

//     console.log("Role Found:", roleFound);
//     if (!roleFound) {
//       return res.status(400).json({
//         errorType: "Role_not_found",
//         message: `Role not found for ${role}`,
//       });
//     } else {
//       await roleAndPermission({ prisma, roleFound });
//       const salt = bcrypt.genSaltSync(10);
//       const hash = await bcrypt.hash(password, salt);
//       const createdUser = await prisma.user.create({
//         data: {
//           username,
//           password: hash,
//           role: {
//             create: {
//               roleName: role as UserRole,
//             },
//           },
//         },
//       });
//       const { sign } = jwt;
//       const token = sign(
//         {
//           username,
//           id: createdUser.id,
//         },
//         process.env.JWT_SECRET_KEY!
//       );

//       console.log({ hash, token });
//       return res.status(201).json({
//         message: "User created successfully",
//         user: createdUser,
//         token,
//       });
//     }
//   } catch (error) {
//     console.error(`Error creating user: ${error}`);
//     return res.status(500).json({
//       errorType: "Internal_server_error",
//       message: "Internal Server Error",
//     });
//   }
// };

const createUser = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({
        errorType: "User_already_exists",
        message: "User already exists",
      });
    }
    const roleFound = await prisma.roles.findFirst({
      where: { roleName: role },
    });
    if (!roleFound) {
      return res.status(400).json({
        errorType: "Role_not_found",
        message: `Role not found for ${role}`,
      });
    } else {
      await roleAndPermission({ prisma, roleFound });
      const salt = bcrypt.genSaltSync(10);
      const hash = await bcrypt.hash(password, salt);
      const createdUser = await prisma.user.create({
        data: {
          username,
          password: hash,
          role: {
            create: {
              roleName: role as UserRole,
            },
          },
        },
      });

      const { sign } = jwt;
      const token = sign(
        {
          username,
          id: createdUser.id,
        },
        process.env.JWT_SECRET_KEY!
      );

      console.log({ hash, token });
      return res.status(201).json({
        message: "User created successfully",
        user: createdUser,
        token,
      });
    }
  } catch (error) {
    console.error(`Error creating user: ${error}`);
    return res.status(500).json({
      errorType: "Internal_server_error",
      message: "Internal Server Error",
    });
  }
};

export default createUser;

export const userController = {
  getAll,
  createUser,
};
