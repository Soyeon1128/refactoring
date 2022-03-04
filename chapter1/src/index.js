import plays from './plays.js';
import invoices from './invoices.js';
import { statement, statementHtml } from './statement.js';

const bill = statement(invoices, plays);
console.log(bill);
const billHtml = statementHtml(invoices, plays);
document.body.innerHTML = billHtml;