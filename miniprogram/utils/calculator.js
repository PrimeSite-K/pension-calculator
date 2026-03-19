const { PAYMENT_MONTHS } = require('../data/cities')

/**
 * 计算养老金
 * @param {Object} params
 * @param {number} params.avgWage        - 退休时当地社平工资（元/月）
 * @param {number} params.payYears       - 缴费年限（年）
 * @param {number} params.avgPayIndex    - 平均缴费指数（缴费基数/社平工资）
 * @param {number} params.retireAge      - 退休年龄
 * @param {number} params.monthlyBase    - 月缴费基数（元）
 */
function calcPension(params) {
  const { avgWage, payYears, avgPayIndex, retireAge, monthlyBase } = params

  // 1. 基础养老金
  const basicPension = avgWage * (1 + avgPayIndex) / 2 * payYears * 0.01

  // 2. 个人账户累计储存额
  // 个人每月缴费 = 缴费基数 × 8%
  // 简化：按复利计算，年利率6%（国家记账利率近似值）
  const monthlyPersonal = monthlyBase * 0.08
  const annualRate = 0.06
  let personalAccount = 0
  for (let y = 0; y < payYears; y++) {
    personalAccount = (personalAccount + monthlyPersonal * 12) * (1 + annualRate)
  }

  // 3. 个人账户养老金
  const paymentMonths = PAYMENT_MONTHS[retireAge] || 139
  const personalPension = personalAccount / paymentMonths

  // 4. 月养老金合计
  const totalMonthly = basicPension + personalPension

  return {
    basicPension: Math.round(basicPension),
    personalPension: Math.round(personalPension),
    personalAccount: Math.round(personalAccount),
    totalMonthly: Math.round(totalMonthly),
    totalAnnual: Math.round(totalMonthly * 12),
    replaceRate: Math.round((totalMonthly / monthlyBase) * 100) // 替代率%
  }
}

/**
 * 计算多个退休年龄的对比
 */
function calcComparison(baseParams, retireAges) {
  return retireAges.map(age => {
    const birthYear = baseParams.birthYear
    const currentYear = new Date().getFullYear()
    const payYears = age - (currentYear - birthYear) + baseParams.currentPayYears
    const result = calcPension({ ...baseParams, retireAge: age, payYears: Math.max(payYears, 15) })
    return { age, ...result }
  })
}

module.exports = { calcPension, calcComparison }
