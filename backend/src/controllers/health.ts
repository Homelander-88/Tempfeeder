import {Request,Response} from "express";
const getHealth = (_req:Request,res:Response) => {
    res.json({
        status: "OK",
        message: "Spoon feeder is running bruh...",
        timestamp: new Date().toISOString(),
    });
};
export {getHealth};