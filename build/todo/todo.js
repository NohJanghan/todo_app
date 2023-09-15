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
        this.findById = {};

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
        this.findById[todo.id] = todo;
    }
    popTodo(todoId) {
        if(typeof todoId != 'number') {
            return false;
        }

        let todo = this.findById[todoId];
        this.findById[todoID] = undefined;
        let yearmonth = todo.date.split('-').reduce((prev, curr) => prev + curr)
        this[yearmonth].forEach((element, index) => {
            if(element.id == todoId) {
                this[yearmonth].splice(index,1);
            }
        });
        return todo;
    }
};

let TodoList = class {
    constructor(db_path = ":memory:") {
        this.openDB(db_path);
        this.todos = new Todos();
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
    /**
     * 
     * @param {string} content (카테고리: 내용)의 포맷
     * @param {string} date yyyy-mm-dd 포맷의 날짜(Localtime)
     * @returns 
     */
    addTodo(content, date) {
        let category, order;
        // content의 형식 ==> 카테고리: 내용
        // 카테고리는 하나만 허용됨
        [category, content]  = content.split(':').map((item, index) => {
            return item.trim();
        })

        //Determine Order
        let yearmonth = date.split('-')[0] + date.split('-')[1];
        let maxOrder = 0
        this.todos[yearmonth].forEach(element => {
            if(element.date.split('-')[2] == date.split('-')[2]) { //날짜(일)이 같은지 확인
                maxOrder = element.order > maxOrder ? element.order : maxOrder;

            }
        });
        order = maxOrder + 1; //가장 마지막에 넣으므로 다른 요소의 순서 변경 필요없음

        if (content == null) {
            return false;
        }
        const insertSQL = "INSERT INTO todo (order, content, category, date) VALUES ((?), (?), (?))";
        let self = this;
        this.db.run(insertSQL, [order, content, category, date], function(err) {
            if(err) throw err;
            console.log("---inserted to DB---");
            console.log("rowid: " + this.lastID);
            const selectSQL = "SELECT id, order, content, status, date, category FROM todo WHERE rowid = ?";
            self.db.get(selectSQL, this.lastID, (err, row) => {
                if(err) throw err;
                if(row === undefined) console.err("No Result");

                let todo = new Todo(row.id, row.content, row.category, row.date, row.status, row.order);
                self.todos.insertTodo(todo);
                console.log("---inserted to todoList---");
                console.log(todo);
            })
        });
    }

    // Read (Month Unit)
    getTodoInMonth(year, month) {
        if (typeof year != 'number' || typeof month != 'number') {
            return null;
        }
        const selectSQL = `SELECT id, order, content, status, date, category FROM todo WHERE date BETWEEN date('${year}-${month}-01','start of month') AND date('${year}-${month}-01', '+1 months', 'start of month', '-1 day') ORDER BY order`;
        this.db.each(selectSQL, (err, row) => {
            if(err) throw err;
            
            let todo = new Todo(row.id, row.content, row.category, row.date, row.status, row.order);
            self.todoContainer.insertTodo(todo);
            console.log("---inserted to todoList---");
            console.log(todo);
        })
    }

    // Update
    /**
     * 
     * @param {number} targetId 목표가되는 todo의 id
     * @param {string} newDate yyyy-mm-dd형식의 date
     */
    updateDate(targetId, newDate) {
        const reg = /^\d{4}--\d{2}--\d{2}$/;
        if(!reg.test(newDate) || typeof targetId != 'number') {
            return null;
        }
        let todo = this.todos.popTodo(todoId);

        //order 변경
        let yearmonth = date.split('-')[0] + date.split('-')[1];
        let maxOrder = 0
        this.todos[yearmonth].forEach(element => {
            if(element.date.split('-')[2] == date.split('-')[2]) { //날짜(일)이 같은지 확인
                maxOrder = element.order > maxOrder ? element.order : maxOrder;
            }
        });
        let newOrder = maxOrder + 1;
        


        const updateSQL = "UPDATE todo SET date = ?, order = ? WHERE id = ?";
        this.db.run(updateSQL, newDate, newOrder, targetId);
        
        //todos 내부에서 데이터 옮기기
        todo.date = newDate;
        todo.order = newOrder;
        this.todos.insertTodo(todo);
    }
    updateContent(targetId, newContent) {
        if(typeof targetId != 'number') return false;

        const updateSQL = "UPDATE todo SET content = ? WHERE id = ?";
        this.db.run(updateSQL, newContent, targetId);

        let todo = this.todos.findById[targetId];
        todo.content = newContent;
    }
    updateState(targetId, newStatus) {
        //TODO: newStatus 검증
        if(typeof targetId != 'number' || typeof newStatus != 'number') return false;

        const updateSQL = "UPDATE todo SET status = ? WHERE id = ?";
        this.db.run(updateSQL, newStatus, targetId);

        let todo = this.todos.findById[targetId];
        todo.status = newStatus;
    }
    updateCategory(targetId, newCategory) {
        if(typeof targetId != 'number') return false;

        const updateSQL = "UPDATE todo SET category = ? WHERE id = ?";
        this.db.run(updateSQL, newCategory, targetId);

        let todo = this.todos.findById[targetId];
        todo.status = newCategory;
    }
    updateOrder(targetId, newOrder) {
        if(typeof targetId != 'number') return false;
        
        const updateSQL = "UPDATE todo SET order = ? WHERE id = ?";
        this.db.run(updateSQL, newOrder, targetId);

        let todo = this.todos.findById[targetId];
        todo.status = newOrder;
    }

};

module.exports = TodoList;