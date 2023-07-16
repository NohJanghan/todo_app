const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db_path = path.join
// open in-memory database
let db = new sqlite3.Database(':memory:', (err) => {
    if(err) {
        return console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
})

function initDB(force = flase) {
    try {
        fs.writeFileSync(db_path, "", {flag: force ? 'w' : 'wx'});
    } catch {
        if (e.code === "EEXIST") return console.error("Already exists!");
        else console.log(e.message);
    }
    
    const createTableSQL = "CREATE TABLE todo (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
    "order INTEGER, "+
    "content TEXT NOT NULL, " + 
    "status INTEGER NOT NULL DEFAULT 0," +
    "date TEXT NOT NULL DEFAULT (date('now', 'localtime'))," +
    "category TEXT"+")";
        db.run(createTableSQL);
    }

    function addTodo(content) {
        let category, order;
        //TODO
        [content, order, category] = parseContent(content).then((content, order, category) => {
            return [content, order, category];
        });
        const queryStmt = "INSERT INTO todo (order, content, category) VALUES ((?), (?), (?))";
        db.run(queryStmt, order, content, category);
    }

    function closeDB() {
        // close database
        db.close((err) => {
            if (err) {
                return console.error(err.message);
            } else {
                console.log('Close the database connection.');
            }
        });
    }

    initDB();

    