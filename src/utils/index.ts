import chalk from "chalk";
import { ErrorRequestHandler } from "express";
import path from "path";
import fs from "fs";

// logs
export const logError = (msg: string) => console.error(chalk.bold.red(msg));
export const logSuccess = (msg: string) => console.log(chalk.bold.green(msg));

export const projectRoot = path.join(__dirname, "..", "..");

export const errorHandler: ErrorRequestHandler = (err, _, res, __) => {
    logError(err);

    return res.status(500).json({ message: "Internal server error!" });
};

export const createDataDir = () => {
    let dir = path.join(projectRoot, "data");

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};
