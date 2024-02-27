const { Sequelize, DataTypes } = require('sequelize');

// Sequelize setup for SQLite database
const sequelizeDB = new Sequelize({
  dialect: 'sqlite',
  storage: 'studentSqlize.db',
  // define: {
  //   timestamps: false, // Disable timestamps. Sequelize won't automatically add these createdAt and updatedAt fields to tables if don't need to track the creation and update times for  records
  // },
});

// Define Sequelize models for student and student_contact
// schema for 'Student' Table 
const Student = sequelizeDB.define('Student', {
  studentid: {
    type: DataTypes.INTEGER,
    primaryKey: true, //primary key
    allowNull: false,
  },
  firstname: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dateofbirth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  grade: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 8 },//domain constraint checks.
  },
  gender: {
    type: DataTypes.TEXT,
    validate: { isIn: [['Male', 'Female']] },//constraints 
  },
});

// schema for StudentContact
const StudentContact = sequelizeDB.define('StudentContact', {
  email: {
    type: DataTypes.TEXT,
  },
  mblnumber: {
    type: DataTypes.TEXT,
    validate: { len: [0, 10] },
  },
  address: {
    type: DataTypes.TEXT,
  },
  guardianname: {
    type: DataTypes.TEXT,
  },
  studentid: { // Foreign key linking to Student table
    type: DataTypes.INTEGER, 
    allowNull: false,
    autoIncrement: false, // Disable auto-increment for studentid
    primaryKey: true, // Make it a primary key if any PK is not used, then sequlize auto genarate for each model.
  },
});

// Sequelize associations between Student and StudentContact
// associations define how the two models are related to each other in the database.
//here it is one to one association meaning Student can have only one contact . foreign key  studentid linking them
Student.hasOne(StudentContact, { foreignKey: 'studentid' });//
StudentContact.belongsTo(Student, { foreignKey: 'studentid' });

//sequelizeDB.sync(): This method synchronizes all defined models with the database. 
//If the tables for the models don't exist in the database, Sequelize will create them
//{ force: true }: force option is set to true, means
// Sequelize will drop all existing tables in the database and recreate them. not suitable for production
sequelizeDB.sync({ force: true }).then(() => {
  // Insert sample data into the tables using callback function, then(()=>{})
  const sampleStudentData = [
    { studentid: 1, firstname: 'John', lastname: 'Doe', dateofbirth: '2000-01-01', grade: 5, gender: 'Male' },
    { studentid: 2, firstname: 'Jane', lastname: 'Smith', dateofbirth: '2001-02-02', grade: 7, gender: 'Female' },
    { studentid: 3, firstname: 'Alex', lastname: 'Johnson', dateofbirth: '1999-03-03', grade: 8, gender: 'Male' },
    { studentid: 4, firstname: 'Eva', lastname: 'Williams', dateofbirth: '2002-04-04', grade: 6, gender: 'Female' },
    { studentid: 5, firstname: 'Michael', lastname: 'Brown', dateofbirth: '2003-05-05', grade: 4, gender: 'Male' },
  ];

  //iterates over each element in the sampleStudentData array.
  //Student.create(data): For each element in the array, it creates a new record in the Student 
  //then((student) => { /* callback */ }) part is a Promise callback. It is executed once the 'create' operation is complete
  sampleStudentData.forEach((data) => {
    Student.create(data).then((student) => {
      console.log(`Student ${student.firstname} ${student.lastname} created.`);
    });
  });

  const sampleContactData = [
    { studentid: 1, email: 'john@example.com', mblnumber: '1111111111', address: '123 Main St', guardianname: 'Guardian Doe' },
    { studentid: 2, email: 'jane@example.com', mblnumber: '2222222222', address: '456 Elm St', guardianname: 'Guardian Smith' },
    { studentid: 3, email: 'alex@example.com', mblnumber: '3333333333', address: '789 Oak St', guardianname: 'Guardian Johnson' },
    { studentid: 4, email: 'eva@example.com', mblnumber: '4444444444', address: '101 Pine St', guardianname: 'Guardian Williams' },
    { studentid: 5, email: 'michael@example.com', mblnumber: '5555555555', address: '202 Maple St', guardianname: 'Guardian Brown' },
  ];

  sampleContactData.forEach((data) => {
    StudentContact.create(data).then(()=>{
      console.log("Contacts added");
    });
  });
});

// Export models and sequelize instance
module.exports = {
  sequelizeDB,
  Student,
  StudentContact,
};
