import express, { Response, Request, Express } from "express";
import dotenv from "dotenv";
import BinRouter from "./routes/bin";
import { Client, Pool } from "pg";
import { createDataDir, errorHandler, logError, logInfo } from "./utils";
import { tableExists, populateDB } from "./db";
import cors from "cors";

const main = async () => {
    dotenv.config();
    await createDataDir();

    // init db
    const pool = new Pool();
    const client = new Client({
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        port: Number(process.env.PGPORT),
        database: process.env.PGDATABASE,
    });

    client
        .connect()
        .then(() => {
            logInfo("Connected to database!");
        })
        .catch((err: Error) => {
            logError(`Could not connect to database!\n${err.message}`);
            throw err;
        });

    // check if `words` table exists
    // else populate db with `/okiba/words.txt`
    if (!(await tableExists(client))) {
        await populateDB(client);
    }

    // start server
    const app: Express = express();
    const port = process.env.PORT;

    // FIX: other bodies panic
    app.use(express.text());

    // check more on this later
    app.use(cors());

    app.get("/", (_: Request, res: Response) => {
        res.send("Hello, World!");
    });
    app.use("/bin/", BinRouter(pool));

    app.use(errorHandler);
    app.listen(port, () => {
        logInfo(`Server started on port ${port}`);
    });
};

main();
