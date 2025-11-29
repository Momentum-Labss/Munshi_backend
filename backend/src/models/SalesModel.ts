import type { ProductType } from "../generated/prisma/enums"
import prisma from "../utils/prismaClient"

export const SalesModel = {
    findByPrice : async (price : number, userId : number ) => {
        return await prisma.smartPriceMap.findMany({
            where : {
                triggerPrice : price,
                product : {
                    userId 
                }
            },
            include : {
                product : true
            }
        })
    },


    findItems : async (userId : number, productType : ProductType) => {
        return await prisma.product.findMany({
            where : {
                userId,
                type : productType
            }
        })
    }
}