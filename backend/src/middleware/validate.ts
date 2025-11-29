import { type Request,type Response,type NextFunction } from 'express';
import { type ZodObject } from 'zod';

export const validate=(schema:ZodObject)=>
    async(req:Request,res:Response,next:NextFunction)=>{
        try{
            const {success, error, data} =  schema.safeParse(req.body)

            if(success && data){
                return next()
            }else if(error){
                throw new Error(error.message)
            }
        }catch(error){
            return res.status(400).json(error)
        }
    }