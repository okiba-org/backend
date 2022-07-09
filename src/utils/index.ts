import chalk from "chalk";
import { ErrorRequestHandler } from "express";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";

// logs
export const logError = (msg: string) => console.error(chalk.bold.red(msg));
export const logSuccess = (msg: string) => console.log(chalk.bold.green(msg));
export const logWarning = (msg: string) => console.log(chalk.bold.yellow(msg));

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
