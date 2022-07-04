import express, { Response, Request, Express } from "express";
import dotenv from "dotenv";

dotenv.config();
const app: Express = express();

const port = process.env.PORT;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
