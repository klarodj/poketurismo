const fs = require('fs');
const path = require('path');

const sqlPath = "c:\\Users\\marco.cioccavasino\\OneDrive - Emmi\\Documenti\\Develop\\Antigravity\\PokeTurismo\\db_old.sql";
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

const carMatch = sqlContent.match(/INSERT INTO `cars` [^;]+;/);
if (carMatch) {
    const stmt = carMatch[0];
    const valuesPart = stmt.split('VALUES')[1];
    
    let count = 0;
    let inString = false;
    let escape = false;
    let inParen = false;
    
    for (let char of valuesPart) {
        if (escape) { escape = false; continue; }
        if (char === '\\') { escape = true; continue; }
        if (char === "'") inString = !inString;
        if (!inString) {
            if (char === '(') inParen = true;
            if (char === ')') {
                inParen = false;
                count++;
            }
        }
    }
    console.log('Total Cars found in SQL block:', count);
} else {
    console.log('No car insert found');
}
