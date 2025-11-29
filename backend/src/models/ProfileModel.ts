import prisma from "../utils/prismaClient"

export const ProfileModel = {
  create: (data: any) => prisma.profile.create({ data }),
  findByUserId: (userId: number) => prisma.profile.findUnique({ where: { userId } }),
  update: (userId: number, data: any) =>
    prisma.profile.update({ where: { userId }, data }),
  delete: (userId: number) =>
    prisma.profile.delete({ where: { userId } }),
  getAll: () => prisma.profile.findMany(),
}
