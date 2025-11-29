import prisma from "../utils/prismaClient";

export const UdhaarService = {
    createCustomer: async (userId: number, name: string, phone: string) => {
        return await prisma.customer.create({
            data: { userId, name, phone, currentDebt: 0 }
        });
    },


    getCustomers: async (userId: number, page: number, limit: number, search?: string, status?: 'PAID' | 'UNPAID' | 'ALL') => {
        const skip = (page - 1) * limit;

        const whereClause: any = {
            userId,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } }
                ]
            }),
        };

        // Filter Logic
        if (status === 'UNPAID') {
            whereClause.currentDebt = { gt: 0 }; // Only people who owe money
        } else if (status === 'PAID') {
            whereClause.currentDebt = { lte: 0 }; // People with 0 debt
        }

        const total = await prisma.customer.count({ where: whereClause });
        console.log(total)
        const customers = await prisma.customer.findMany({
            where: whereClause,
            skip,
            take: limit,
            // If viewing UNPAID, sort by highest debt (risk). Otherwise sort by recency.
            orderBy: status === 'UNPAID' ? { currentDebt: 'desc' } : { updatedAt: 'desc' } 
        });

        return {
            data: customers,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }
};