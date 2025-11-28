import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const UdhaarService = {
    createCustomer: async (userId: number, name: string, phone: string) => {
        return await prisma.customer.create({
            data: { userId, name, phone, currentDebt: 0 }
        });
    },

    /**
     * Search & List Customers
     * @param onlyDebtors - If true, only returns people who owe money (>0)
     */
    getCustomers: async (userId: number, page: number, limit: number, search?: string, onlyDebtors?: boolean) => {
        const skip = (page - 1) * limit;

        const whereClause: any = {
            userId,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } }
                ]
            }),
            ...(onlyDebtors && {
                currentDebt: { gt: 0 } // Greater than 0
            })
        };

        const total = await prisma.customer.count({ where: whereClause });

        const customers = await prisma.customer.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: onlyDebtors ? { currentDebt: 'desc' } : { updatedAt: 'desc' } 
            // If looking for debtors, show highest debt first. Else show recent activity.
        });

        return {
            data: customers,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }
};