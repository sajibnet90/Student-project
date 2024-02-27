// FILE: server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const port = 8090;


// Express middleware to parse JSON
//app.use(express.json());
//or we can use bodyparser
app.use(bodyParser.json());

const greetingMessage = { message: 'Hello World!' };

//routes for greetings base route
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(302).json(greetingMessage);
});

// -------------Endpoint to retrieve all students-------------------
app.get('/students', (req, res) => {
    db.all('SELECT * FROM student', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// ------------Endpoint to retrieve student data by ID-----------------
app.get('/students/:id', (req, res) => { //:id route parameter
    const id = req.params.id; //extracts the value of the id parameter from the request URL

    // Validate that id is a valid integer // when if expression evaluates to true it res.status is error
    if (!Number.isInteger(parseInt(id))) {//parseInt(id) convert string to int or it returns NaN
                                          //Number.isInteger() retn true if value is an integer, and false otherwise 
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }

    db.get('SELECT * FROM student WHERE studentid = ?', [id], (err, row) => { //SQL query ? placeholder replaced by value of [id] then execute callback fuc
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) { // if the query result row is falsy //or no row found with given id 
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        res.json(row);
    });
});

// ------------Endpoint to retrieve student by firstname and lastname QUERY param-------------------
app.get('/students-query', (req, res) => {
    let firstname = req.query.firstname;
	let lastname = req.query.lastname;
    console.log('Firstname:', firstname);
    console.log('Lastname:', lastname);

    // Validate that both firstname and lastname are provided in the query params
    if (!firstname || !lastname) {
        res.status(400).json({ error: 'Both firstname and lastname are required' });
        return;
    }

    db.all('SELECT * FROM student WHERE firstname = ? AND lastname = ?', [firstname, lastname], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row.length === 0) { // if the query result row is falsy //or no row found with given firstname and lastnaem
            res.status(404).json({ error: 'Student not found with given firstname and lastname' });
            return;
        }
        res.json(row);
    });
});

//-----------------------------------------------------------------------------------------------//
//curl --silent --include "http://localhost:8090/students"
//curl --silent --include "http://localhost:8090/students/1"
//curl --silent --include "http://localhost:8090/students-query?firstname=John&lastname=Doe"
//-------------------------------------------------------------------------------//

// -------------Endpoint to retrieve all student_contacts------------
app.get('/student_contacts', (req, res) => {
    db.all('SELECT * FROM student_contact', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// --------------Endpoint to retrieve student contact by mobile number query params----------------
app.get('/student_contacts/query', (req, res) => {
    const mobileNumber = req.query.mobile;

    // Validate that mobileNumber is provided
    if (!mobileNumber) {
        res.status(400).json({ error: 'Mobile number is required' });
        return;
    }

    db.all('SELECT * FROM student_contact WHERE mblnumber = ?', [mobileNumber], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (rows.length === 0) {
            res.status(404).json({ error: 'No student contact found with the provided mobile number' });
            return;
        }

        res.json(rows);
    });
});


// -------------Endpoint to retrieve student contact by ID---------------
app.get('/student_contacts/:id', (req, res) => {
    const id = req.params.id;

    // Validate that id is a valid integer
    if (!Number.isInteger(parseInt(id))) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }

    db.get('SELECT * FROM student_contact WHERE studentid = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        //if there are no row with given data
        if (!row) {
            res.status(404).json({ error: 'Student contact not found' });
            return;
        }

        res.json(row);
    });
});

//---------POST data to student table---------------------------------

// /Students Endpoint to add a new student obj POST method
app.post('/students', (req, res) => {
    const { studentid, firstname, lastname, dateofbirth, grade, gender } = req.body;//destructure all props

    // Validate required fields if any missing
    if (!studentid || !firstname || !lastname || !dateofbirth || !grade || !gender) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }

    // Insert new student into the database //placeholders (?) for values and 
    //provides an array of values to be substituted.
    db.run(
        'INSERT INTO student (studentid, firstname, lastname, dateofbirth, grade, gender) VALUES (?, ?, ?, ?, ?, ?)',
        [studentid, firstname, lastname, dateofbirth, grade, gender], // array values to substitute the corrresponding placeholders '?'
        function (err) { //callback anonymus function to check err //anonymous callback function (err) { ... } is invoked after the execution of the SQL query
                           // function (err) {... as equvalent syntax as arrow fuc like - (err)=> {...
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.status(201).json({ message: 'Student added successfully' });
        }
    );
});
//curl --silent --include -X POST -H "Content-Type: application/json" -d '{"studentid": 6, "firstname": "New", "lastname": "Student", "dateofbirth": "2004-06-06", "grade": 3, "gender": "Male"}' "http://localhost:8090/students"

// ------------Endpoint to delete a student by ID-----------------
app.delete('/students/:id', (req, res) => {
    const id = req.params.id; 
    // Validate that id is a valid integer
    if (!Number.isInteger(parseInt(id))) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }

    // Check if the student with the given id exists before attempting to delete
    db.get('SELECT * FROM student WHERE studentid = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        // If the student exists, proceed to delete
        db.run('DELETE FROM student WHERE studentid = ?', [id], (deleteErr) => {
            if (deleteErr) {
                res.status(500).json({ error: deleteErr.message });
                return;
            }

            res.json({ message: 'Student deleted successfully' });
        });
    });
});

//curl -X DELETE http://localhost:8090/students/1


// ------------------Start the Express server-----------------------
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

//SIGINT is signal inturrupt,  is generated when the user presses Ctrl+C in the terminal.
//and event listener is triggered
process.on('SIGINT', () => {
    db.close(() => {
        console.log('Database connection closed.');
        process.exit(0);
    });
});

//curl --silent --include "http://localhost:8090/student_contacts"
//curl --silent --include "http://localhost:8090/student_contacts/1"
//curl --silent --include "http://localhost:8090/student_contacts/query?mobile=5555555555"

