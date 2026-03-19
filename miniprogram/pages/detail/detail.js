const { calcPension } = require('../../utils/calculator')

Page({
  data: {
    result: {},
    comparison: [],
    cityName: '',
    retireAge: 60,
    payYears: 0,
    monthlyBase: 0,
    extraYears: [],
    gapYears: []
  },

  onLoad(options) {
    const data = JSON.parse(decodeURIComponent(options.data))
    const { result, comparison, cityName, retireAge, payYears, monthlyBase } = data

    // 多缴年限分析
    const avgWage = monthlyBase // 简化：用缴费基数近似社平工资
    const avgPayIndex = 1
    const extraYears = [1, 3, 5, 10].map(years => {
      const newResult = calcPension({
        avgWage,
        payYears: payYears + years,
        avgPayIndex,
        retireAge,
        monthlyBase
      })
      const diff = newResult.totalMonthly - result.totalMonthly
      return {
        years,
        diff,
        annualDiff: diff * 12
      }
    })

    // 断缴影响分析
    const gapYears = [1, 2, 3, 5].map(years => {
      const newPayYears = Math.max(payYears - years, 15)
      const newResult = calcPension({
        avgWage,
        payYears: newPayYears,
        avgPayIndex,
        retireAge,
        monthlyBase
      })
      const diff = result.totalMonthly - newResult.totalMonthly
      const pct = Math.round((diff / result.totalMonthly) * 100)
      return { years, diff, pct }
    })

    this.setData({ result, comparison, cityName, retireAge, payYears, monthlyBase, extraYears, gapYears })
  },

  recalc() {
    wx.navigateBack({ delta: 2 })
  },

  onShareAppMessage() {
    return {
      title: `我测算了退休后每月能领¥${this.data.result.totalMonthly}，你也来算算`,
      path: '/pages/index/index'
    }
  }
})
