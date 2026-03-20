const { PAYMENT_MONTHS } = require('../data/cities')

/**
 * 计算养老金
 * @param {Object} params
 * @param {number} params.avgWage        - 退休时当地社平工资（元/月）
 * @param {number} params.payYears       - 缴费年限（年）
 * @param {number} params.avgPayIndex    - 平均缴费指数
 * @param {number} params.retireAge      - 退休年龄
 * @param {number} params.monthlyBase    - 月缴费基数（元）
 * @param {number} params.existingAccount - 个人账户现有余额（元，可选）
 */
function calcPension(params) {
  const { avgWage, payYears, avgPayIndex, retireAge, monthlyBase, existingAccount = 0 } = params

  // 1. 基础养老金
  // 公式：退休时社平工资 × (1 + 平均缴费指数) ÷ 2 × 缴费年限 × 1%
  const basicPension = avgWage * (1 + avgPayIndex) / 2 * payYears * 0.01

  // 2. 个人账户累计储存额
  // 每月个人缴费 = 缴费基数 × 8%
  // 0利率，纯线性累计（不计复利）
  const monthlyPersonal = monthlyBase * 0.08
  const newAccumulated = monthlyPersonal * 12 * payYears
  // 个人账户总额 = 现有余额（不计利息）+ 新增累计
  const personalAccount = existingAccount + newAccumulated

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
    replaceRate: Math.round((totalMonthly / monthlyBase) * 100),
    // 计算过程中间数据
    avgWage: Math.round(avgWage),
    avgPayIndex,
    payYears,
    retireAge,
    monthlyBase: Math.round(monthlyBase),
    monthlyPersonal: Math.round(monthlyPersonal),
    paymentMonths,
    existingAccount: Math.round(existingAccount),
    newAccumulated: Math.round(newAccumulated)
  }
}

module.exports = { calcPension }
