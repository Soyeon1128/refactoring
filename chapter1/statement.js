const plays = require('./plays.json');
const invoice = require('./invoices.json');

module.exports = function statement(invoice, plays) {
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;
  for (let perf of invoice.performances) {
    result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
  }

  result += `총액: ${usd(totalAmount())}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;

  return result;
}

// USD 단위로 포맷팅
function usd(aNumber) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minumumFractionDigits: 2
  }).format(aNumber/100);
}

// 공연정보 가져오기
function playFor(perf) {
  return plays[perf.playID];
}

// 총 포인트 계산
function totalVolumeCredits() {
  let volumeCredits = 0;
  for (let perf of invoice.performances) {
    volumeCredits += volumeCreditsFor(perf);
  }
  return volumeCredits;
}

// 포인트 계산
function volumeCreditsFor(aPerformance) {
  let result = 0;
  result += Math.max(aPerformance.audience - 30, 0);
  if ('comedy' === playFor(aPerformance).type) result += Math.floor(aPerformance.audience / 5);
  return result;
}

// 총 금액 계산
function totalAmount() {
  let totalAmount = 0;
  for (let perf of invoice.performances) {
    totalAmount += amountFor(perf);
  }
  return totalAmount;
}

// 공연별 금액 계산
function amountFor(aPerformance) {
  let result = 0;
  switch (playFor(aPerformance).type) {
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
      throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
  }
  return result;
}