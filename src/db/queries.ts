// query strings
export const Query = {
    getAvailableWord:
        "SELECT * FROM words WHERE taken = 'f' ORDER BY random() LIMIT 1;",

    setWordTaken(id: number) {
        return `UPDATE words SET taken = 't' WHERE id = ${id}`;
    },
};
