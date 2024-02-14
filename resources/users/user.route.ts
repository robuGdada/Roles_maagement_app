import express from "express";
import { userController, verifyUser } from "./user.controller";
import { prisma } from "../../server";

export const userRoute = express.Router();

userRoute.get("/user", async (req, res) => {
  await userController.getAll(req, res);
});

userRoute.post("/create-user", async (req, res) => {
  await userController.createUser(req, res);
});

userRoute.post("/signin", verifyUser, async (req, res) => {
  await userController.signin(req, res);
});
