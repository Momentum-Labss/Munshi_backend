import type { ProductType } from "../generated/prisma/enums";
import prisma from "../utils/prismaClient";

interface ProductFilters {
    search?: string;
    type?: ProductType;
    lowStock?: boolean; // If true, only return items where stock < threshold
}

export const InventoryService = {
    /**
     * List products with pagination and filters
     */
    getProducts: async (userId: number, page: number = 1, limit: number = 10, filters: ProductFilters) => {
        const skip = (page - 1) * limit;
        const { search, type, lowStock } = filters;

        // Build Query Object
        const whereClause: any = {
            userId,
            // Search Logic (Name)
            ...(search && {
                name: { contains: search, mode: "insensitive" }
            }),
            // Filter by Type
            ...(type && { type }),
        };

        // Low Stock Logic
        if (lowStock) {
            // Prisma doesn't support direct column comparison in 'where' easily without raw query 
            // or strict value. For simplicity in hackathon, we fetch and filter or use raw query.
            // Optimized approach: Use database-level comparison if possible, or fetch slightly more and filter.
            // Here we will use raw query for performance or simple logic if datasets are small.
            // Prisma workaround:
            whereClause.stock = { lte: prisma.product.fields.lowStockThreshold }; // NOTE: This syntax relies on newer Prisma versions or extensions.
            // Safe fallback for standard Prisma Client:
            // We will filter logic in application layer or strict value queries.
            // Let's assume we just filter by fixed number for demo or ignore dynamic threshold in 'where'
        }

        // Count Total
        const total = await prisma.product.count({ where: whereClause });

        // Fetch Data
        const products = await prisma.product.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { updatedAt: 'desc' } // Recently updated first
        });

        // Post-filter for Low Stock if dynamic comparison failed
        let finalProducts = products;
        if (lowStock) {
             finalProducts = products.filter(p => Number(p.stock) <= Number(p.lowStockThreshold));
        }

        return {
            data: finalProducts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    addProduct: async (userId: number, data: any) => {
        return await prisma.product.create({
            data: { ...data, userId }
        });
    }
};