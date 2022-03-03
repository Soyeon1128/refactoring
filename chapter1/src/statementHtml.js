// import createStatementData from './createStatementData.js';

export default function statement(invoice, plays) {
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

// createStatementData
function createStatementData(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  return statementData;

  function enrichPerformance(aPerformance) {
    const result = Object.assign({}, aPerformance);
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }

  // 공연정보 가져오기
  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  // 공연별 금액 계산
  function amountFor(aPerformance) {
    let result = 0;
    switch (aPerformance.play.type) {
      case 'tragedy':
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case 'comedy':
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`);
    }
    return result;
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