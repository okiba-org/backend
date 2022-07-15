import { Request, Response, Router } from "express";
import fsp from "fs/promises";
import path from "path";
import { Pool } from "pg";
import { getAvailableWord, getWordFromVal, setWordTaken } from "../db/bin";
import { getPastePath, projectRoot } from "../utils";
import { Word } from "../utils/types";

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

    router.get("/paste/:id", async (req: Request, res: Response) => {
        const id: string = req.params.id;

        if (id == undefined || id == "") {
            return res.status(400).json({ message: "Invalid paste id!" });
        }

        // verify word
        let word = await getWordFromVal(db, id);
        if (word == undefined || !word.taken) {
            return res.status(404).json({ message: "Paste not found!" });
        }

        // send paste
        const paste = await fsp
            .readFile(getPastePath(word.val), {
                encoding: "utf-8",
            })
            .catch((err: Error) => {
                throw err;
            });

        res.set("Content-type", "text/plain");
        return res.status(200).send(paste);
    });

    return router;
}
