import express, { Response, Request, Express } from "express";
import dotenv from "dotenv";
import BinRouter from "./routes/bin";
import { Client, Pool } from "pg";
import { createDataDir, errorHandler, logError, logSuccess } from "./utils";

const main = async () => {
    dotenv.config();
    createDataDir();

    // init db
    const pool = await new Pool();
    const client = await new Client();

    client
        .connect()
        .then(() => {
            logSuccess("Connected to database!");
        })
        .catch((err: Error) => {
            logError(`Could not connect to database! \n\n${err.message}`);
            throw err;
        });

    // start server
    const app: Express = express();
    const port = process.env.PORT;

    app.use(express.text());

    app.get("/", (req: Request, res: Response) => {
        res.send("Hello, World!");
    });
    app.use("/bin/", BinRouter(pool));

    app.use(errorHandler);
    app.listen(port, () => {
        logSuccess(`Server started on port ${port}`);
    });
};

main();
