import { logError, logSuccess, projectRoot } from "../utils";
import fs from "fs";
import path from "path";
import { Client, QueryResult } from "pg";

export const tableExists = async (db: Client): Promise<boolean> => {
    const result = await db
        .query(
            "SELECT EXISTS (SELECT * FROM information_schema.tables WHERE table_name = 'words');"
        )
        .catch((err) => err);

    return result.rows[0].exists;
};

// used for generating param query string
// expand(rowCount: 3, columnCount: 2) returns "($1, $2), ($3, $4), ($5, $6)"
function expand(rowCount: number, columnCount = 1, startAt = 1) {
    var index = startAt;
    return Array(rowCount)
        .fill(0)
        .map(
            (v) =>
                `(${Array(columnCount)
                    .fill(0)
                    .map((v) => `$${index++}`)
                    .join(", ")})`
        )
        .join(", ");
}

export const populateDB = async (db: Client) => {
    let filename = "words.txt";
    let filepath = path.join(projectRoot, filename);

    // check for source file
    if (!fs.existsSync(filepath)) {
        logError(
            "Could not find `okiba/words.txt` for populating the database!\n"
        );
        process.exit(1);
    }

    await db
        .query(
            "CREATE TABLE words (id SERIAL PRIMARY KEY, val VARCHAR NOT NULL, taken BOOLEAN DEFAULT 'f');"
        )
        .catch((err) => err);

    fs.readFile(
        filepath,
        { encoding: "utf-8" },
        async (err: Error | null, data: string) => {
            if (err != null) {
                logError(err.message);
                throw err;
            }

            let arr: Array<string> = data.split("\r\n");

            // 1k entries per query
            const chunkSize = 1000;
            for (let i = 0; i < arr.length; i += chunkSize) {
                const chunk: Array<string> = arr.slice(i, i + chunkSize);

                const queryStr = {
                    text: `INSERT INTO words (val) VALUES ${expand(
                        chunk.length
                    )}`,
                    values: chunk,
                };

                await db.query(queryStr);
            }
        }
    );

    logSuccess("Successfully populated the database!");
};
