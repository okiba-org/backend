import { Pool, QueryResult } from "pg";
import { Word } from "../utils/types";

// query wrappers
export const getAvailableWord = async (db: Pool): Promise<Word | undefined> => {
    let query =
        "SELECT * FROM words WHERE taken = 'f' ORDER BY random() LIMIT 1;";
    const data: void | QueryResult<Word> = await db
        .query(query)
        .catch((err) => err);

    return data?.rows[0];
};

export const setWordTaken = async (db: Pool, id: number) => {
    let query = `UPDATE words SET taken = 't' WHERE id = ${id}`;
    await db.query(query).catch((err) => err);
};

export const getWordFromVal = async (
    db: Pool,
    id: string
): Promise<Word | undefined> => {
    let query = `SELECT * FROM words WHERE val = '${id}';`;
    let results: QueryResult<Word> | void = await db
        .query(query)
        .catch((err) => err);
    return results?.rows[0];
};
