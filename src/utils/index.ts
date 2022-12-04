import { ErrorRequestHandler } from "express";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";

// logs
export const logInfo = (msg: any) => console.info(`\x1b[36m%s\x1b[0m`, `[INFO] ${msg}`);
export const logError = (msg: any) => console.error(`\x1b[31m`, `[ERR] ${msg}`);
export const logWarn = (msg: any) => console.warn(`\x1b[33m`, `[WARN] ${msg}`);

export const projectRoot = path.join(__dirname, "..", "..");

// generate paste path string
export const getPastePath = (word: string): string => {
    return path.join(projectRoot, "data", word + ".txt");
};

export const errorHandler: ErrorRequestHandler = (err, _, res, __) => {
    logError(err);

    return res.status(500).json({ message: "Internal server error!" });
};

export const createDataDir = async () => {
    let dir = path.join(projectRoot, "data");

    if (!fs.existsSync(dir)) {
        await fsp.mkdir(dir);
    }
};
