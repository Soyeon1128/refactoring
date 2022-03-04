// import createStatementData from './createStatementData.js';
export const statementHtml = (invoice, plays) => {
  return renderHtml(createStatementData(invoice, plays));

  function renderHtml(data, plays) {
    let result = `<h1>청구 내역 (고객명: ${data.customer})</h1>\n`;
    result += '<table>\n';
    result +=  
`<tr>
  <th>연극</th>
  <th>좌석 수</th>
  <th>금액</th>
</tr>`;
    for (let perf of data.performances) {
      result +=
`<tr>
  <td>${perf.play.name}</td>
  <td>${usd(perf.amount)}</td>
  <td>(${perf.audience}석)</td>
</tr>`;
    }
    result += '</table>\n';
    result += 
`<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`;
    result += 
`<p>적립 포인트: <em>${data.totalVolumeCredits}점</em></p>\n`;
    return result;
  
    // USD 단위로 포맷팅
    function usd(aNumber) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minumumFractionDigits: 2
      }).format(aNumber/100);
    }
  }
}

export const statement = (invoice, plays) => {
  return renderPlainText(createStatementData(invoice, plays));

  function renderPlainText(data, plays) {
    let result = `청구 내역 (고객명: ${data.customer})\n`;
    for (let perf of data.performances) {
      result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`;
    }
    result += `총액: ${usd(data.totalAmount)}\n`;
    result += `적립 포인트: ${data.totalVolumeCredits}점\n`;
    return result;
  
    // USD 단위로 포맷팅
    function usd(aNumber) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minumumFractionDigits: 2
      }).format(aNumber/100);
    }
  }
}

class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance;
    this.play = aPlay;
  }
  get amount() {
    throw new Error('서브클래스에서 처리하도록 설계되었습니다.');
  }
  get volumeCredits() {
    return Math.max(this.performance.audience - 30, 0);
  }
}

class TragedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 0;
    result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 0;
    result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }
  get volumeCredits() {
    return super.volumeCredits +  Math.floor(this.performance.audience / 5);
  }
}

function createPerformanceCalculator(aPerformance, aPlay) {
  switch (aPlay.type) {
    case 'tragedy': return new TragedyCalculator(aPerformance, aPlay);
    case 'comedy': return new ComedyCalculator(aPerformance, aPlay);
    default:
      throw new Error(`알 수 없는 장르: ${aPlay.type}`);
  }
}

function createStatementData(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  return statementData;

  function enrichPerformance(aPerformance) {
    const calculator = createPerformanceCalculator(aPerformance, playFor(aPerformance));
    const result = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits;
    return result;
  }

  // 공연정보 가져오기
  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }
  
  // 공연별 금액 계산
  function amountFor(aPerformance) {
    return new PerformanceCalculator(aPerformance, playFor(aPerformance)).amount;
  }  
  
  // 포인트 계산
  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ('comedy' === aPerformance.play.type) result += Math.floor(aPerformance.audience / 5);
    return result;
  }
  
  // 총 포인트 계산
  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
  }
  
  // 총 금액 계산
  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }  
}