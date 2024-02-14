import { NextFunction, Request, Response } from "express";
import { userRepo } from "./user.repo";
import { PrismaClient, User } from "@prisma/client";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../server";
import { permissionRole } from "./role.permission";

const getAll = async (req: Request, res: Response) => {
  const currentPage = Number(req.query.page) || 1;
  const pageSize = Number(req.query.page_size) || 10;
  const offset = pageSize * (currentPage - 1);
  const searchVal = req.query.q;
  console.log("controller bhitra chiryo", { searchVal });
  try {
    if (!searchVal) {
      const users = await userRepo.getAll(offset, pageSize);

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
  const { username, password, roleId } = req.body;
  const userData = { username, password };
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
    if (roleId) {
      permissionRole(roleId);
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);
    const createdUser = await prisma.user.create({
      data: {
        username,
        password: hash,
        roleId,
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
  } catch (error) {
    console.error(`Error creating user: ${error}`);
    return res.status(500).json({
      errorType: "Internal_server_error",
      message: "Internal Server Error",
    });
  }
};

const signin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log({ username });
  try {
    const existingUser = await userRepo.getOneUser(username);

    if (!existingUser) {
      return res
        .status(400)
        .json({ errorType: "USER_NOT_FOUND", message: "User not found." });
    }

    if (!existingUser) {
      return res.status(400).json({
        errorType: "USER_NOT_FOUND",
        message: "USER NOT FOUND",
      });
    }
    const matchPassword = bcrypt.compareSync(
      password,
      String(existingUser?.password)
    );
    if (!matchPassword) {
      return res.status(400).json({
        errorType: "INVALID_CREDENTIALS",
        message: "Invalid credentials.",
      });
    }
    const { sign } = jwt;
    const token = sign(
      { username: existingUser?.username, id: existingUser?.id },
      process.env.JWT_SECRET_KEY!
    );
    console.log({ existingUser });
    return res.status(200).json({ user: existingUser, token });
  } catch (e) {
    console.log(e);
    return res

      .status(400)
      .json({ errorType: "USER_NOT_FOUND", message: "User not found." });
  }
};

//middleware for userauth
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }
  try {
    console.log("token in middleware:", token);
    const { verify } = jwt;
    const decoded: any = verify(token, process.env.JWT_SECRET_KEY!);

    console.log({ decoded });
    const user = await userRepo.getOneUser({ id: decoded.id });
    req.authUser = user as User;
    if (user) {
      next();
      // return res.status(201).json({ message: "nice intiative" });
    } else {
      return res.status(401).json({ message: "token invalid." });
    }
  } catch (e) {
    return res.status(401).json({ message: "token invalid." });
    // console.log(e);
  }
};
//middleware for Permission Verify

type UserPermission = {
  permission: {
    action: string;
  };
};

export const permissionVerify = (requiredActions: string[]) => {
  return async (
    req: Request & { authUser: { roleId: number } },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { roleId } = req.authUser;

      const userPermissions: UserPermission[] =
        await prisma.permissionOnRole.findMany({
          where: {
            roleId,
          },
          select: {
            permission: {
              select: {
                action: true,
              },
            },
          },
        });

      // Extract action strings from the result
      const userActionStrings = userPermissions.map((p) => p.permission.action);

      // Check if all required actions are present in the user's permissions
      const allActionsPresent = requiredActions.every((a) =>
        userActionStrings.includes(a)
      );

      if (allActionsPresent) {
        next();
      } else {
        return res.status(403).json({
          errorType: "Permission_denied",
          message: `Permission denied. User does not have all of the required permissions (${requiredActions.join(
            ", "
          )}).`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        errorType: "Internal_server_error",
        message: "Internal Server Error",
      });
    }
  };
};
export const userController = {
  getAll,
  createUser,
  signin,
  verifyUser,
};
