const fs = require('fs');
const path = require('path');

// Path to the students.json file
const studentsFilePath = path.join(__dirname, 'data', 'students.json');

// Function to generate a unique admission number
const generateAdmissionNo = () => {
    return Math.floor(Math.random() * 1000000); // Generates a random 6-digit number
};

// Read the students.json file
fs.readFile(studentsFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading students.json:', err);
        return;
    }

    // Parse the JSON data
    let students = JSON.parse(data);

    // Add admissionNo to each student
    students = students.map((student, index) => {
        return {
            ...student,
            admissionNo: student.admissionNo || generateAdmissionNo() + index // Ensures unique admissionNo even for large datasets
        };
    });

    // Write the updated data back to students.json
    fs.writeFile(studentsFilePath, JSON.stringify(students, null, 2), (err) => {
        if (err) {
            console.error('Error writing to students.json:', err);
        } else {
            console.log('Admission numbers added to students.json successfully.');
        }
    });
});
