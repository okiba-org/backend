import { Pool, QueryResult } from "pg";
import { Word } from "../utils/types";
import { Query } from "./queries";

// query wrappers
export const getAvailableWord = async (db: Pool): Promise<Word | undefined> => {
    const data: void | QueryResult<Word> = await db
        .query(Query.getAvailableWord)
        .catch((err) => err);

    if (data != undefined) {
        let word = data.rows[0];
        return word;
    }

    return undefined;
};

export const setWordTaken = async (db: Pool, id: number) => {
    await db.query(Query.setWordTaken(id)).catch((err) => err);
};
