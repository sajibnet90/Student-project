// FILE: SeqlizeServer.js
const express = require('express');
const bodyParser = require('body-parser');
const { sequelizeDB, Student, StudentContact } = require('./SeqlizeDatabase');

const app = express();
const port = 8091;

// Express middleware to parse JSON
app.use(bodyParser.json());

// -----------------------------------REST Endpoints--------------------------------------------
//----------------------------Student Table----------------------
// Get all students
app.get('/students', async (req, res) => {
  const students = await Student.findAll();//Wait for the Student.findAll() operation to complete, and 
                                          //then assign the result to the students variable. findAll() is a sequelize method
  res.json(students);//Once Student.findAll() operation is complete and the result is stored in students, 
                      //the function proceeds to send a JSON response containing the retrieved student data.
});

// Get student by ID
app.get('/students/:id', async (req, res) => {
  const id = req.params.id;
  const student = await Student.findByPk(id);//findByPk() sequelize method
  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ error: 'Student not found' });//error handeling //404 requested resource is not found.

  }
});

// Get student by firstname and lastname
app.get('/students-query', async (req, res) => {
  const firstname = req.query.firstname; //query parameter from the request's query string.
  const lastname = req.query.lastname;
  if (firstname && lastname) { //if both name exists
    const students = await Student.findAll({//Student.findAll is used to  get all students where the firstname and lastname match the provided values.
                                            //await for the asynchronous database operation to complete.
      where: { firstname, lastname },
    });
    if (students.length > 0) {
      res.json(students);
    } else {
      //404 requested resource is not found.
      res.status(404).json({ error: 'No student found with given firstname and lastname' });
    }
  } else {
        //400 client has made an incomplete request
    res.status(400).json({ error: 'Both firstname and lastname are required in query params' });
  }
});
//------------------------------Post method Student table------------------
// Create a new student POST method
app.post('/students', async (req, res) => {
  const { studentid, firstname, lastname, dateofbirth, grade, gender } = req.body;//Destructures the properties from the request body.
  if (studentid && firstname && lastname && dateofbirth && grade && gender) {
    try {
      const newStudent = await Student.create({
        studentid,
        firstname,
        lastname,
        dateofbirth,
        grade,
        gender,
      });
      //201, indicating a resource has been successfully created.
      res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
      //if error occurs during creation of the new student (e.g., a database error) then 500
      res.status(500).json({ error: error.message });
    }
  } else {
    //incomplete client req
    res.status(400).json({ error: 'All fields are required in the request body' });
  }
});

// -------------Delete student by ID Delete method------------
app.delete('/students/:id', async (req, res) => {
  const id = req.params.id;
  const student = await Student.findByPk(id);
  if (student) {
    await student.destroy();
    res.json({ message: 'Student deleted successfully' });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});
//--------------------------PUT to Update method Student Table----------------------
// Update a student information by ID
app.put('/students/:id', async (req, res) => {
  const id = req.params.id; // Extracting student ID from the request parameters
  const { firstname, lastname, dateofbirth, grade, gender } = req.body; // Extracting student information from the request body

  if (firstname && lastname && dateofbirth && grade && gender) { // Checking if all required fields exists
    try {
      const student = await Student.findByPk(id); // Finding the student by their ID=studentid primary key
      if (student) { //if exists
        await student.update({ 
          // Update the student information with the new values, it doesn't update the primary key itself,bcoz we need to update existing student info
          firstname,lastname,dateofbirth,grade,gender,
        });
        res.json({ message: 'Student information updated successfully', student });
      } else {
        // if the student is not found
        res.status(404).json({ error: 'Student not found' });
      }
    } catch (error) {
      // if an error occurs during the update 500
      res.status(500).json({ error: error.message });
    }
  } else {
    // if any required field is missing in the request body
    res.status(400).json({ error: 'All fields are required in the request body' });
  }
});


//----------------------student_contact table-------------------------------------
// Get all student_contacts
app.get('/student_contacts', async (req, res) => {
  const contacts = await StudentContact.findAll();
  res.json(contacts);
});


// Get student contact by mobile number
app.get('/student_contacts/query', async (req, res) => {
  const mobileNumber = req.query.mobile;
  if (mobileNumber) {
    const contacts = await StudentContact.findAll({
      where: { mblnumber: mobileNumber },
    });
    if (contacts.length > 0) {
      res.json(contacts);
    } else {
      res.status(404).json({ error: 'No student contact found with the provided mobile number' });
    }
  } else {
    res.status(400).json({ error: 'Mobile number is required in query params' });
  }
});

// Get student contact by ID
app.get('/student_contacts/:id', async (req, res) => {
  const id = req.params.id;
  const contact = await StudentContact.findByPk(id);
  if (contact) {
    res.json(contact);
  } else {
    res.status(404).json({ error: 'Student contact not found' });
  }
});
//----------------------------------------------------------------------------
//-----------------------get method by joining table--------------------------
// Get student information by joing  both tables and find by ID=studentid
app.get('/students-with-contacts/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const studentWithContact = await Student.findOne({
      where: { studentid: id },
      include: [{ model: StudentContact, attributes: ['email', 'mblnumber', 'address', 'guardianname'] }],
    });

    if (studentWithContact) {
      res.json(studentWithContact);
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --------------------starting the server--------------
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

//SIGINT is signal inturrupt,  is generated when the user presses Ctrl+C in the terminal.
//and event listener is triggered
process.on('SIGINT', () => {
  sequelizeDB.close().then(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});
