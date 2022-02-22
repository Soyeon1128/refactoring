const plays = require('./plays.json');
const invoices = require('./invoices.json');
const statement = require('./statement.js');

const bill = statement(invoices, plays);
console.log(bill);