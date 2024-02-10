import { Request, Response } from "express";
import { IUserData, userRepo } from "./user.repo";
import { PrismaClient } from "@prisma/client";
import { roleAndPermission } from "./role.permission";

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
const createUser = async (req: Request, res: Response) => {
  const { username, role } = req.body;

  const userData: IUserData = {
    username,
    role,
  };
  console.log({ userData });

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

    console.log({ role: roleFound });

    if (!roleFound) {
      return res.status(400).json({
        errorType: "Role_not_found",
        message: `Role not found for ${userData.role}`,
      });
    } else {
      await roleAndPermission({ prisma, roleFound });
    }

    await userRepo.createUser(userData);
    return res.status(201).json({ message: "User created successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errorType: "Internal_server_error",
      message: "Internal Server Error",
    });
  }
};

export const userController = {
  getAll,
  createUser,
};
