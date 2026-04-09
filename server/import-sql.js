const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB migration from db_old.sql...');
  const sqlPath = path.join(__dirname, '..', 'db_old.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // We will extract blocks of INSERT INTO
  // Pattern: INSERT INTO `tableName` (...) VALUES (....);
  // since phpMyAdmin dumps usually have a single INSERT INTO with multiple values separated by commas:
  // INSERT INTO `table` (...) VALUES
  // (1, 'A', 'B'),
  // (2, 'C', 'D');

  // More robust split: handle different line endings or multiple newlines
  const statements = sqlContent.split(/;\s*[\r\n]+/);

  for (let stmt of statements) {
    stmt = stmt.trim();
    if (!stmt) continue;
    
    const insertIdx = stmt.toUpperCase().indexOf('INSERT INTO');
    if (insertIdx === -1) continue;
    
    // Slice from where the actual INSERT starts
    stmt = stmt.substring(insertIdx);

    // Extract table name
    const tableMatch = stmt.match(/INSERT INTO\s+`?([^`\s(]+)`?/i);
    if (!tableMatch) continue;
    const tableName = tableMatch[1];
    
    console.log(`Table detected: ${tableName}`);
    
    // Extract column names
    const colsMatch = stmt.match(/\(([^)]+)\)\s+VALUES/i);
    if (!colsMatch) continue;
    const colsStr = colsMatch[1];
    const columns = colsStr.split(',').map(c => c.replace(/`/g, '').trim());

    // Extract values block
    const valuesPart = stmt.split(/VALUES/i)[1].trim();
    
    const rows = [];
    let currentRow = [];
    let currentVal = '';
    let inString = false;
    let escapeLevel = false;
    let inParen = false;

    for (let i = 0; i < valuesPart.length; i++) {
        const char = valuesPart[i];
        
        if (escapeLevel) {
            currentVal += char;
            escapeLevel = false;
            continue;
        }
        if (char === '\\') {
            escapeLevel = true;
            continue;
        }

        if (char === "'" && !inString) {
            inString = true;
            currentVal += char;
        } else if (char === "'" && inString) {
            inString = false;
            currentVal += char;
        } else if (char === '(' && !inString) {
            inParen = true;
            currentRow = [];
            currentVal = '';
        } else if (char === ')' && !inString) {
            inParen = false;
            currentRow.push(parseValue(currentVal.trim()));
            if (currentRow.length === columns.length) {
                rows.push(currentRow);
            }
            currentVal = '';
        } else if (char === ',' && !inString && inParen) {
            currentRow.push(parseValue(currentVal.trim()));
            currentVal = '';
        } else {
            if (inParen) {
                currentVal += char;
            }
        }
    }

    const dataObjects = rows.map(row => {
      const obj = {};
      columns.forEach((col, idx) => {
        let finalCol = col;
        if (col === '0100') finalCol = 'zeroToHundred';
        // Map related ID fields
        if (['brand', 'user', 'car', 'part', 'type', 'surface', 'meteo', 'track', 'section'].includes(col)) {
           finalCol = col + 'Id';
           // Special case for mods table where 'car' refers to 'garageId'
           if (tableName === 'mods' && col === 'car') finalCol = 'garageId';
        }
        obj[finalCol] = row[idx];
      });
      return obj;
    });

    const modelName = getPrismaModelName(tableName);
    if (!modelName || !prisma[modelName]) continue;

    console.log(`Table ${tableName}: parsed ${dataObjects.length} records. Models accessor: ${modelName}`);
    if (dataObjects.length > 0) console.log('Sample record:', JSON.stringify(dataObjects[0], null, 2));

    let count = 0;
    const failedIds = [];
    for (let obj of dataObjects) {
      try {
        if (tableName === 'trackBuild' && !obj.id) {
           await prisma[modelName].create({ data: obj });
        } else {
          await prisma[modelName].upsert({
            where: { id: obj.id },
            update: obj,
            create: obj
          });
        }
        count++;
      } catch (e) {
        if (tableName === 'cars') {
            failedIds.push(obj.id);
            console.error(`Error in ${tableName} (ID: ${obj.id}):`, e.message);
            console.log('Record data:', JSON.stringify(obj, null, 2));
        } else if (count === 0) {
            console.error(`Error in ${tableName} (ID: ${obj.id}):`, e.message);
        }
      }
    }
    console.log(`Table ${tableName}: successfully processed ${count} records.`);
    if (failedIds.length > 0) console.warn(`Failed Car IDs: ${failedIds.join(', ')}`);
  }

  console.log('Migration finished successfully!');
  const carCount = await prisma.car.count();
  console.log('FINAL CAR COUNT IN DB:', carCount);
}

function parseValue(val) {
   if (val === 'NULL') return null;
   if (val.startsWith("'") && val.endsWith("'")) {
       const str = val.substring(1, val.length - 1).replace(/\\'/g, "'").replace(/\\"/g, '"');
       // Detect MySQL date: YYYY-MM-DD HH:MM:SS
       if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) {
           return new Date(str.replace(' ', 'T') + 'Z').toISOString();
       }
       return str;
   }
   if (!isNaN(val) && val !== '') {
       if (val.includes('.')) return parseFloat(val);
       return parseInt(val, 10);
   }
   return val;
}

function getPrismaModelName(sqlTable) {
   const map = {
       'brands': 'brand',
       'cars': 'car',
       'classes': 'class',
       'garages': 'garage',
       'levels': 'level',
       'mods': 'mod',
       'parts': 'part',
       'trackBuild': 'trackBuild',
       'trackMeteo': 'trackMeteo',
       'tracks': 'track',
       'trackSections': 'trackSection',
       'trackSurfaces': 'trackSurface',
       'trackType': 'trackType',
       'users': 'user'
   };
   return map[sqlTable];
}

main().catch(console.error).finally(() => prisma.$disconnect());
