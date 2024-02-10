import express from "express";
import { userController } from "./user.controller";

export const userRoute = express.Router();

userRoute.post("/create-user", async (req, res) => {
  await userController.createUser(req, res);
});

userRoute.get("/user", async (req, res) => {
  await userController.getAll(req, res);
});
