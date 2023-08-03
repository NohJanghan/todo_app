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

const db_path = ':memory';
const todoList = {
    db: new sqlite3.Database(db_path, (err) => {
        if(err) {
            return console.error(err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    }),

}
Object.freeze(todoList);

let TodoList = class {
    constructor(db_path = ":memory:") {
        this.openDB(db_path);
        this.todoContainer = new Todos();
    }
    openDB(db_path) {
        this.closeDB();

        this.db = new sqlite3.Database(db_path, (err) => {
            if(err) {
                console.error(err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        })
    }
    async closeDB() {
        if(this.db instanceof sqlite3.Database) {
            await this.db.close((err) => {
                if(err) {
                    console.err(err.message);
                }
            });
            return true;
        }
        return false;
    }


};