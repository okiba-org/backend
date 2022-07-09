import { Router, Request, Response, NextFunction } from "express";
import { Pool, QueryResult } from "pg";
import fs from "fs";
import path from "path";
import { Word } from "../utils/types";
import fsp from "fs/promises";
import { projectRoot } from "../utils";
import { getAvailableWord, setWordTaken } from "../db/bin";

export default function BinRouter(db: Pool) {
    const router: Router = Router();

    router.post("/paste", async (req: Request, res: Response) => {
        let body: string = req.body;
        if (body == undefined || body == "") {
            return res.status(400).json({ message: "Invalid body!" });
        }

        const word: Word | undefined = await getAvailableWord(db);

        if (word != undefined) {
            await fsp.writeFile(
                path.join(projectRoot, "data", word.val + ".txt"),
                body
            );

            await setWordTaken(db, word.id);

            return res.status(200).json({
                endpoint: word.val,
                message: "Code pasted successfully!",
            });
        }

        res.status(500).json({ message: "Something went wrong" });
    });

    return router;
}
