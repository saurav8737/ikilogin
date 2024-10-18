const fs = require('fs');

fs.readFile('data/students.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading students.json:', err);
        return;
    }

    let students = JSON.parse(data);
    students = students.map((student, index) => ({
        ...student,
        id: student.id || (index + 1) // Assign an id if it doesn't exist
    }));

    fs.writeFile('data/students.json', JSON.stringify(students, null, 2), (err) => {
        if (err) {
            console.error('Error writing to students.json:', err);
        } else {
            console.log('Successfully added IDs to students.');
        }
    });
});
