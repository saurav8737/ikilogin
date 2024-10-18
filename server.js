const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // To handle JSON payloads
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Storage setup for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Load students and faculties from JSON files
let students = [];
let faculties = [];

fs.readFile('data/students.json', 'utf8', (err, data) => {
    if (!err && data) {
        students = JSON.parse(data).map((student, index) => ({
            ...student,
            id: student.id || Date.now() + index // Assign an id if it doesn't exist
        }));
        saveData('data/students.json', students);
    }
});

fs.readFile('data/faculties.json', 'utf8', (err, data) => {
    if (!err && data) {
        faculties = JSON.parse(data).map((faculty, index) => ({
            ...faculty,
            id: faculty.id || Date.now() + index // Assign an id if it doesn't exist
        }));
    }
});

// Save function to save data to JSON files
const saveData = (filename, data) => {
    fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
        if (err) console.error(`Error writing to ${filename}:`, err);
    });
};

app.use('/Images', express.static(path.join(__dirname, 'Images')));

// Routes for serving static HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/enroll-student.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'enroll-student.html'));
});

app.get('/enroll-faculty.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'enroll-faculty.html'));
});

app.get('/enrolled-students.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'enrolled-students.html'));
});

app.get('/enrolled-faculties.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'enrolled-faculties.html'));
});

// Enroll student route
app.post('/enroll-student', upload.single('photo'), (req, res) => {
    const { firstName, lastName, dob, gender, fatherName, motherName, schoolName, tuitionFee, mobileNo, admissionDate, class: currentClass, address, areaPinCode, city, state } = req.body;
    const photo = req.file ? req.file.filename : null;
    const student = {
        id: Date.now(), // Generate a unique ID
        firstName,
        lastName,
        dob,
        gender,
        fatherName,
        motherName,
        schoolName,
        tuitionFee,
        mobileNo,
        admissionDate,
        currentClass,
        address,
        areaPinCode,
        city,
        state,
        photo
    };
    students.push(student);
    saveData('data/students.json', students);
    res.redirect('/admin-dashboard.html');
});

// Enroll faculty route
app.post('/enroll-faculty', upload.single('photo'), (req, res) => {
    const { firstName, lastName, dob, gender, facultyOf, fatherName, motherName, mobileNo, joiningDate, address, areaPinCode, city, state } = req.body;
    const photo = req.file ? req.file.filename : null;
    const faculty = {
        id: Date.now(),
        firstName,
        lastName,
        dob,
        gender,
        facultyOf,
        fatherName,
        motherName,
        mobileNo,
        joiningDate,
        address,
        areaPinCode,
        city,
        state,
        photo
    };
    faculties.push(faculty);
    saveData('data/faculties.json', faculties);
    res.redirect('/admin-dashboard.html');
});

// API to get enrolled students (for dynamically populating the student selection)
app.get('/api/students', (req, res) => {
    res.json(students);
});

// API to get enrolled faculties
app.get('/api/faculties', (req, res) => {
    res.json(faculties);
});

// Generate fee receipt route
app.post('/generate-fee-receipt', (req, res) => {
    const { studentId, amount, paymentDate } = req.body;
    const parsedStudentId = parseInt(studentId, 10); // Convert studentId to number
    
    console.log(`Received studentId: ${studentId}, parsedStudentId: ${parsedStudentId}`); // Debugging log
    const selectedStudent = students.find(s => s.id === parsedStudentId);

    if (selectedStudent) {
        const receipt = `
            <html>
            <head>
                <title>Fee Receipt</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    header { text-align: center; }
                    .receipt-container { max-width: 600px; margin: 0 auto; }
                    .receipt-header { text-align: center; margin-bottom: 20px; }
                    .student-photo { float: right; margin-left: 20px; width: 100px; height: 100px; object-fit: cover; }
                    .receipt-details { clear: both; display: flex; justify-content: space-between; }
                    .receipt-details div { width: 45%; }
                    .receipt-details p { margin: 5px 0; }
                </style>
            </head>
            <body>
                <header>
                    <h1>Impact Knowledge Institute</h1>
                </header>
                <div class="receipt-container">
                    <div class="receipt-header">
                        <h2>Fee Receipt</h2>
                    </div>
                    <div class="receipt-details">
                        <div>
                            <h3><b>Student's Details</b></h3>
                            <p><strong>Student Name:</strong> ${selectedStudent.firstName} ${selectedStudent.lastName}</p>
                            <p><strong>Father's Name:</strong> ${selectedStudent.fatherName}</p>
                            <p><strong>Student's Class:</strong> ${selectedStudent.currentClass}</p>
                            <p><strong>Admission Date:</strong> ${selectedStudent.admissionDate}</p>
                            <p><strong>Payment Date:</strong> ${paymentDate}</p>
                            <p><strong>Amount:</strong> ${amount}</p><br><br>
                            <p align="right"><strong>Director's Sign:</strong> ____________</p>
                            <p align="right"><strong>Date:</strong> ${paymentDate}</p>
                        </div>
                        <div>
                            ${selectedStudent.photo ? `<img src="/uploads/${selectedStudent.photo}" class="student-photo" alt="Student Photo">` : ''}
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
        res.send(receipt);
    } else {
        res.status(404).send('Student not found');
    }
});

// Generate salary slip route
app.post('/generate-salary-slip', (req, res) => {
    const { facultyId, amount, paymentDate } = req.body;
    const parsedFacultyId = parseInt(facultyId, 10); // Convert facultyId to number
    
    console.log(`Received facultyId: ${facultyId}, parsedFacultyId: ${parsedFacultyId}`); // Debugging log
    const selectedFaculty = faculties.find(f => f.id === parsedFacultyId);

    if (selectedFaculty) {
        const salarySlip = `
            <html>
            <head>
                <title>Salary Slip</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    header { text-align: center; }
                    .salary-container { max-width: 600px; margin: 0 auto; }
                    .salary-header { text-align: center; margin-bottom: 20px; }
                    .faculty-photo { float: right; margin-left: 20px; width: 100px; height: 100px; object-fit: cover; }
                    .salary-details { clear: both; display: flex; justify-content: space-between; }
                    .salary-details div { width: 45%; }
                    .salary-details p { margin: 5px 0; }
                </style>
            </head>
            <body>
                <header>
                    <h1>Impact Knowledge Institute</h1>
                </header>
                <div class="salary-container">
                    <div class="salary-header">
                        <h2>Salary Slip</h2>
                    </div>
                    <div class="salary-details">
                        <div>
                            <h3><b>Faculty's Details</b></h3>
                            <p><strong>Faculty Name:</strong> ${selectedFaculty.firstName} ${selectedFaculty.lastName}</p>
                            <p><strong>Faculty Of:</strong> ${selectedFaculty.facultyOf}</p>
                            <p><strong>Joining Date:</strong> ${selectedFaculty.joiningDate}</p>
                            <p><strong>Payment Date:</strong> ${paymentDate}</p>
                            <p><strong>Amount:</strong> ${amount}</p><br><br>
                            <p align="right"><strong>Director's Sign:</strong> _____________</p>
                            <p align="right"><strong>Date:</strong> ${paymentDate}</p>
                        </div>
                        <div>
                            ${selectedFaculty.photo ? `<img src="/uploads/${selectedFaculty.photo}" class="faculty-photo" alt="Faculty Photo">` : ''}
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
        res.send(salarySlip);
    } else {
        res.status(404).send('Faculty not found');
    }
});

// Delete faculty route
app.delete('/delete-faculty/:id', (req, res) => {
    const facultyId = parseInt(req.params.id, 10); // Get the faculty ID from the URL
    const facultyIndex = faculties.findIndex(f => f.id === facultyId); // Find the index of the faculty

    if (facultyIndex !== -1) {
        faculties.splice(facultyIndex, 1); // Remove the faculty from the array
        saveData('data/faculties.json', faculties); // Save the updated array to the JSON file
        res.status(200).send({ message: 'Faculty deleted successfully' }); // Respond with success
    } else {
        res.status(404).send({ message: 'Faculty not found' }); // Respond with an error if the faculty was not found
    }
});
// API to get a specific student by ID
app.get('/api/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id, 10); // Parse the student ID from the URL
    const student = students.find(s => s.id === studentId); // Find the student with the given ID
    
    if (student) {
        res.json(student); // Send the student data as JSON
    } else {
        res.status(404).json({ message: 'Student not found' }); // Send a 404 error if the student is not found
    }
});


// Delete student route
app.delete('/delete-student/:id', (req, res) => {
    const studentId = parseInt(req.params.id, 10); // Get the student ID from the URL
    const studentIndex = students.findIndex(s => s.id === studentId); // Find the index of the student

    if (studentIndex !== -1) {
        students.splice(studentIndex, 1); // Remove the student from the array
        saveData('data/students.json', students); // Save the updated array to the JSON file
        res.status(200).send({ message: 'Student deleted successfully' }); // Respond with success
    } else {
        res.status(404).send({ message: 'Student not found' }); // Respond with an error if the student was not found
    }
});


// Login route

app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'SAURAV007' && password === 'Saurav@123') {
        res.redirect('/admin-dashboard.html');
    } else {
        // Redirect to login page with an error query parameter
        res.redirect('/admin-login.html?error=1');
    }
});



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

});
