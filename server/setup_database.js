const mysql = require('mysql2');
const dbConfig = { host: 'localhost', user: 'root', password: '', multipleStatements: true };
const connection = mysql.createConnection(dbConfig);

const MIGRATION_SCRIPT = `
    DROP DATABASE IF EXISTS student_housing;
    CREATE DATABASE student_housing;
    USE student_housing;
    
    CREATE TABLE verhuurder (id INT AUTO_INCREMENT PRIMARY KEY, naam VARCHAR(255), email VARCHAR(255), telefoonnummer VARCHAR(255), password_hash VARCHAR(255));
    CREATE TABLE studentencomplex (id INT AUTO_INCREMENT PRIMARY KEY, adres VARCHAR(255), verhuurder_id INT);
    CREATE TABLE student (id INT AUTO_INCREMENT PRIMARY KEY, naam VARCHAR(255), email VARCHAR(255), studentkamer INT, studentencomplex_id INT, password_hash VARCHAR(255));
    CREATE TABLE aankondiging (id INT AUTO_INCREMENT PRIMARY KEY, titel VARCHAR(255), datum DATETIME, beschrijving TEXT, student_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE klacht (id INT AUTO_INCREMENT PRIMARY KEY, student_id INT, beschrijving VARCHAR(255), datum DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE announcement_views (id INT AUTO_INCREMENT PRIMARY KEY, aankondiging_id INT, student_id INT, viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_view (aankondiging_id, student_id));
    
    INSERT INTO student (naam, email, studentkamer, studentencomplex_id) VALUES ('Gio', 'gio@s.nl', 101, 1), ('Sasha', 'sasha@s.nl', 102, 1), ('Luuk', 'luuk@s.nl', 103, 1);
    INSERT INTO aankondiging (titel, datum, beschrijving, student_id) VALUES ('Oud & Nieuw', '2024-01-01 20:00:00', 'Oud', 2), ('Huisfeest Gio', DATE_ADD(NOW(), INTERVAL 5 DAY), 'Bier', 1);
`;

connection.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL. Running migration...");
    connection.query(MIGRATION_SCRIPT, (err) => {
        if (err) throw err;
        console.log("✅ Database setup complete!");
        connection.end();
    });
});
