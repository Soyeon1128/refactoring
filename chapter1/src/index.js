import plays from './plays.js';
import invoices from './invoices.js';
import statement from './statement.js';
import statementHtml from './statementHtml.js';

const bill = statement(invoices, plays);
console.log(bill);
const billHtml = statementHtml(invoices, plays);
document.body.innerHTML = billHtml;