const fs = require('fs');
const path = require('path');

// Path to the faculties JSON file
const facultiesFilePath = path.join(__dirname, 'data', 'faculties.json');

// Function to save data to JSON file
const saveData = (filename, data) => {
    fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error(`Error writing to ${filename}:`, err);
        } else {
            console.log(`Successfully updated ${filename}`);
        }
    });
};

// Read the faculties JSON file
fs.readFile(facultiesFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading faculties file:', err);
        return;
    }

    let faculties = JSON.parse(data);

    // Add unique ID to each faculty member if they don't have one
    faculties = faculties.map((faculty, index) => ({
        ...faculty,
        id: faculty.id || Date.now() + index
    }));

    // Save the updated faculties back to the file
    saveData(facultiesFilePath, faculties);
});
