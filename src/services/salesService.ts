import { PaymentMode, ProductType, TimeBucket } from "../generated/prisma/enums";
import { SalesModel } from "../models/SalesModel";
import prisma from "../utils/prismaClient";

type Suggestion = {
    id : string,
    name : string,
    type :ProductType,
    icon : string,
    price : number,
    score : number,
    weight : number | null
}


interface TransactionItem {
    productId: string;
    name: string;
    price: number;
    quantity?: number; // For packaged
    weight?: number;   // For loose
    isLoose: boolean;
}

interface TransactionFilters {
    mode?: PaymentMode;
    startDate?: Date;
    endDate?: Date;
}

interface TransactionDTO {
    userId: number;
    items: TransactionItem[];
    totalAmount: number;
    mode: PaymentMode;
    customerId?: string;
}


interface salesDTO {
    userId : number;
}

export const SalesService = {
    getSuggestion : async (price : number, userId : number) : Promise<{packagedSuggestion : Suggestion[], looseSuggestion : Suggestion[]}> => {
        const currentBucket = getCurrentTime();
        const packagedSuggestion :Suggestion[] = []
        const looseSuggestion : Suggestion[] = []
        const [smartMatches, looseItems] =  await Promise.all([SalesModel.findByPrice(price, userId), SalesModel.findItems(userId, ProductType.Loose)])

        smartMatches.forEach((match) => {
            const buckets = match.timeBuckets as Record<string, number>
            const timeWeight = buckets[currentBucket.toLowerCase()] || 0

            const score = (match.globalSalesCount * 0.4) + (timeWeight * 0.6);

            packagedSuggestion.push({
                id: match.productId,
                name: match.productName, 
                type: ProductType.Packaged,
                icon: match.product.icon,
                price: Number(match.triggerPrice),
                score: score,
                weight: null
            });
        })


        looseItems.forEach((item) => {
            const itemPricePerKg =  Number(item.price);
            if(itemPricePerKg <= 0 ) return
            const weightInKg = price / itemPricePerKg
            let score = 10
            if(weightInKg  % 0.25 === 0) score += 50
            else if (weightInKg % 0.1 === 0) score += 20;
            if (weightInKg >= 0.05) {
                looseSuggestion.push({
                    id: item.id,
                    name: `${item.name} (${formatWeight(weightInKg)})`,
                    type: ProductType.Loose,
                    icon: item.icon,
                    price: price,
                    score: score,
                    weight: weightInKg
                });
            }
        })


        return {
            packagedSuggestion : packagedSuggestion.sort((a,b) => b.score - a.score).slice(0,9),
            looseSuggestion : looseSuggestion.sort((a,b) => b.score - a.score).slice(0,9)
        }
    },

    processTransaction : async (data : TransactionDTO) => {
        const {userId, items, totalAmount, mode, customerId} = data

        const currentBucket = getCurrentTime()
        const nudges : string[] = []

        return await prisma.$transaction(async (tx) => {
            // 1. Create the Transaction Record
            const newTx = await tx.transaction.create({
                data: {
                    userId,
                    totalAmount,
                    mode,
                    customerId,
                    timeBucket: currentBucket,
                    items: items as any, // Storing JSON snapshot
                }
            });

            // 2. Process Each Item (Inventory & Learning)
            for (const item of items) {
                const qtyToDeduct = item.isLoose ? item.weight : item.quantity;
                
                // A. Deduct Inventory
                if (qtyToDeduct && item.productId) {
                    const updatedProduct = await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: qtyToDeduct
                            }
                        }
                    });

                    // B. Check Nudge (Low Stock)
                    if (Number(updatedProduct.stock) < Number(updatedProduct.lowStockThreshold)) {
                        nudges.push(`Low Stock Alert: ${updatedProduct.name} (Only ${updatedProduct.stock} left)`);
                    }

                    // C. Train the Brain (Update SmartPriceMap)
                    // We only train for PACKAGED items usually, or explicit loose mappings
                    // Logic: Find a map for this Product + Price combination
                    const existingMap = await tx.smartPriceMap.findFirst({
                        where: {
                            productId: item.productId,
                            triggerPrice: item.price
                        }
                    });

                    if (existingMap) {
                        // Update existing learning weights
                        const buckets = existingMap.timeBuckets as Record<string, number>;
                        const currentCount = buckets[currentBucket.toLowerCase()] || 0;
                        
                        await tx.smartPriceMap.update({
                            where: { id: existingMap.id },
                            data: {
                                globalSalesCount: { increment: 1 },
                                lastSoldAt: new Date(),
                                timeBuckets: {
                                    ...buckets,
                                    [currentBucket.toLowerCase()]: currentCount + 1
                                }
                            }
                        });
                    } else {
                        // Create new learning path (First time sold at this price)
                        await tx.smartPriceMap.create({
                            data: {
                                productId: item.productId,
                                productName: item.name,
                                triggerPrice: item.price,
                                globalSalesCount: 1,
                                timeBuckets: {
                                    [currentBucket.toLowerCase()]: 1
                                }
                            }
                        });
                    }
                }
            }

            // 3. Handle Udhaar (Credit)
            if (mode === PaymentMode.UDHAAR && customerId) {
                await tx.customer.update({
                    where: { id: customerId },
                    data: {
                        currentDebt: { increment: totalAmount },
                        lastPurchaseDate: new Date()
                    }
                });
            }

            return { transactionId: newTx.id, nudges };
        });
    },

    getTransaction : async (userId: number, page: number, limit: number, filters: TransactionFilters) => {
        const skip = (page - 1) * limit;
        const { mode, startDate, endDate } = filters;

        const whereClause: any = {
            userId: userId, // CRITICAL: Only fetch this user's data
            
            // Optional: Filter by Cash/Udhaar
            ...(mode && { mode }),
            
            // Optional: Filter by Date Range
            createdAt: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate })
            }
        };

        // 2. Get Total Count (for Pagination Meta)
        const total = await prisma.transaction.count({ where: whereClause });

        // 3. Fetch Data
        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            skip: skip,
            take: limit,
            orderBy: { createdAt: 'desc' }, // Newest first
            include: {
                customer: {
                    select: { name: true, phone: true } // Show customer name if Udhaar
                }
            }
        });

        return {
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}



function getCurrentTime () {
    const hour = new Date().getHours()
    if(hour >= 5 && hour < 12) return TimeBucket.MORNING
    if (hour >= 12 && hour < 17) return TimeBucket.AFTERNOON;
    return TimeBucket.EVENING; // Covers evening and night
}

function formatWeight(kg: number): string {
    if (kg >= 1) return `${kg}kg`;
    return `${kg * 1000}g`;
}