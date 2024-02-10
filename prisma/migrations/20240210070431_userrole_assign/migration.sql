/*
  Warnings:

  - You are about to alter the column `roleName` on the `roles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `roles` MODIFY `roleName` ENUM('ADMIN', 'MOD', 'USER') NOT NULL;
