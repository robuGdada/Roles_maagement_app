import { PrismaClient } from "@prisma/client";

const ACTIONS = ["create", "read", "update", "delete"];
const RESOURCES = ["todos", "user"];
const prisma = new PrismaClient();
export async function seeding() {
  ACTIONS.forEach((action) => {
    RESOURCES.forEach(async (resources) => {
      await prisma.todo.create({});
    });
  });
}
