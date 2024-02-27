//FILE:database.js
const sqlite3 = require('sqlite3').verbose();

// SQLite database setup
const db = new sqlite3.Database('school.db');

db.serialize(() => {
   // Create the student table
   db.run(`
   CREATE TABLE IF NOT EXISTS student (
       studentid INTEGER PRIMARY KEY UNIQUE NOT NULL,
       firstname TEXT,
       lastname TEXT,
       dateofbirth DATE,
       grade INTEGER CHECK (grade BETWEEN 1 AND 8),
       gender TEXT CHECK (gender IN ('Male', 'Female'))
   )
`);

// Create indexes on grade and gender columns for faster queries
db.run('CREATE INDEX IF NOT EXISTS idx_student_grade ON student(grade)');
db.run('CREATE INDEX IF NOT EXISTS idx_student_gender ON student(gender)');

// Create the student_contact table with foreign key reference to studentid
//also used domain constraints
// not using  primary key in this table //contactid INTEGER PRIMARY KEY NOT NULL,
db.run(`
   CREATE TABLE student_contact (
       studentid INTEGER NOT NULL,
       email TEXT,
       mblnumber TEXT CHECK (length(mblnumber) <= 10),
       address TEXT,
       guardianname TEXT,
       FOREIGN KEY (studentid) REFERENCES student(studentid)
   )
`);

// Populate tables with sample data
const sampleStudentData = [
   { studentid: 1, firstname: 'John', lastname: 'Doe', dateofbirth: '2000-01-01', grade: 5, gender: 'Male' },
   { studentid: 2, firstname: 'Jane', lastname: 'Smith', dateofbirth: '2001-02-02', grade: 7, gender: 'Female' },
   { studentid: 3, firstname: 'Alex', lastname: 'Johnson', dateofbirth: '1999-03-03', grade: 8, gender: 'Male' },
   { studentid: 4, firstname: 'Eva', lastname: 'Williams', dateofbirth: '2002-04-04', grade: 6, gender: 'Female' },
   { studentid: 5, firstname: 'Michael', lastname: 'Brown', dateofbirth: '2003-05-05', grade: 4, gender: 'Male' },
];

const sampleContactData = [
   { studentid: 1, email: 'john@example.com', mblnumber: '1111111111', address: '123 Main St', guardianname: 'Guardian Doe' },
   { studentid: 2, email: 'jane@example.com', mblnumber: '2222222222', address: '456 Elm St', guardianname: 'Guardian Smith' },
   { studentid: 3, email: 'alex@example.com', mblnumber: '3333333333', address: '789 Oak St', guardianname: 'Guardian Johnson' },
   { studentid: 4, email: 'eva@example.com', mblnumber: '4444444444', address: '101 Pine St', guardianname: 'Guardian Williams' },
   { studentid: 5, email: 'michael@example.com', mblnumber: '5555555555', address: '202 Maple St', guardianname: 'Guardian Brown' },
];

sampleStudentData.forEach((data) => {
   db.run(
       'INSERT INTO student (studentid, firstname, lastname, dateofbirth, grade, gender) VALUES (?, ?, ?, ?, ?, ?)',
       [data.studentid, data.firstname, data.lastname, data.dateofbirth, data.grade, data.gender]
   );
});

sampleContactData.forEach((data) => {
   db.run(
       'INSERT INTO student_contact (studentid, email, mblnumber, address, guardianname) VALUES (?, ?, ?, ?, ?)',
       [data.studentid, data.email, data.mblnumber, data.address, data.guardianname]
   );
});
});

module.exports = db;
