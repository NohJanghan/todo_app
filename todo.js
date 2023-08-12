const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

let Todo = class {
    constructor(_id, _content, _category, _date, _status, _order) {
        this.id = _id;
        this.content = _content;
        this.category = _category;
        this.date = _date;
        this.status = _status;
        this.order = _order;
    }
};

let Todos = class extends Object {
    constructor() {

    }
    /**
     * todo를 날짜로 분류하여 저장
     * 
     * @param {Todo} todo Todos에 보관할 todo
     */
    insertTodo(todo) {
        let [year, month] = todo.date.split('-');
        let yearmonth = year + month;
        
        if(this.hasOwnProperty(yearmonth)) {
            this[yearmonth].push(todo);
        } else {
            this[yearmonth] = [todo];
        }
    }
};

let TodoList = class {
    constructor(db_path = ":memory:") {
        this.openDB(db_path);
        this.todoContainer = new Todos();
    }
    openDB(db_path, doInit = true) {
        this.closeDB();

        this.db = new sqlite3.Database(db_path, (err) => {
            if(err) {
                console.error(err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        })
        
        if(doInit) {
            const checkTables = "SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%';";
            this.db.all(checkTables, (err, rows) => {
                if(err) {
                    console.err(err.message);
                }

                if(rows.length === 0) {
                    const createTableSQL = "CREATE TABLE todo (" +
                                        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                                        "order INTEGER, "+
                                        "content TEXT NOT NULL, " + 
                                        "status INTEGER NOT NULL DEFAULT 0," +
                                        "date TEXT NOT NULL DEFAULT (date('now', 'localtime'))," +
                                        "category TEXT"+")";
                    this.db.run(createTableSQL);
                }
            })
        }
    }
    async closeDB() {
        if(this.db instanceof sqlite3.Database) {
            let flag = true;
            await this.db.close((err) => {
                if(err) {
                    console.err(err.message);
                }
                flag = false;
            });
            return flag;
        } else {
            return false;
        }
    }
    // Create
    addTodo(content) {
        let category, order;
        // parseContent 구현해야함
        [content, order, category] = parseContent(content);
        if (content == null) {
            return false;
        }
        const insertSQL = "INSERT INTO todo (order, content, category) VALUES ((?), (?), (?))";
        let self = this;
        this.db.run(insertSQL, [order, content, category], function(err) {
            if(err) throw err;
            console.log("---inserted to DB---");
            console.log("rowid: " + this.lastID);
            const selectSQL = "SELECT * FROM todo WHERE rowid = ?";
            self.db.get(selectSQL, this.lastID, (err, row) => {
                if(err) throw err;
                if(row === undefined) console.err("No Result");

                let todo = new Todo(row.id, row.content, row.category, row.date, row.status, row.order);
                self.todoContainer.insertTodo(todo);
                console.log("---inserted to todoList---");
                console.log(todo);
            })
        });
    }


};