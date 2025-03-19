import { Request, Response } from "express";
import db from "../config/db.config";

const getExample = async (req: Request, res: Response) => {
    try {
        const result = await db.any("SELECT NOW() as time");
        res.status(200).json(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export { getExample }