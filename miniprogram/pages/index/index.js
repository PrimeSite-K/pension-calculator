const { CITIES } = require('../../data/cities')
const { calcPension } = require('../../utils/calculator')

Page({
  data: {
    cityNames: CITIES.map(c => c.name),
    cityIndex: 0,
    gender: 'male',
    birthYear: 1985,
    startYear: 2010,
    avgPayIndex: 1.00,
    retireAge: 60,
    monthlyBase: 0,
    payYears: 0
  },

  onLoad() {
    this.updateDerived()
  },

  updateDerived() {
    const { cityIndex, birthYear, startYear, retireAge } = this.data
    const city = CITIES[cityIndex]
    const monthlyBase = city.avgWage // 月缴费基数默认用社平工资
    const currentYear = new Date().getFullYear()
    const payYears = Math.max(retireAge - (currentYear - birthYear) + (currentYear - startYear), 15)
    this.setData({ monthlyBase, payYears })
  },

  onCityChange(e) {
    this.setData({ cityIndex: +e.detail.value })
    this.updateDerived()
  },

  setGender(e) {
    this.setData({ gender: e.currentTarget.dataset.val })
    this.updateDerived()
  },

  onBirthYearChange(e) {
    this.setData({ birthYear: +e.detail.value })
    this.updateDerived()
  },

  onStartYearChange(e) {
    this.setData({ startYear: +e.detail.value })
    this.updateDerived()
  },

  onPayIndexInput(e) {
    const val = parseFloat(e.detail.value)
    if (!isNaN(val)) {
      this.setData({ avgPayIndex: val })
    }
  },

  onRetireAgeInput(e) {
    const val = parseInt(e.detail.value)
    if (!isNaN(val) && val >= 50 && val <= 70) {
      this.setData({ retireAge: val })
      this.updateDerived()
    }
  },

  calculate() {
    const { cityIndex, birthYear, startYear, retireAge, avgPayIndex, monthlyBase, payYears } = this.data
    const city = CITIES[cityIndex]

    // 输入校验
    if (!avgPayIndex || avgPayIndex <= 0 || avgPayIndex > 3) {
      wx.showToast({ title: '缴费指数请填写 0.6~3 之间的数值', icon: 'none' })
      return
    }
    if (!retireAge || retireAge < 50 || retireAge > 70) {
      wx.showToast({ title: '退休年龄请填写 50~70 之间', icon: 'none' })
      return
    }

    const result = calcPension({
      avgWage: city.avgWage,
      payYears,
      avgPayIndex,
      retireAge,
      monthlyBase
    })

    // 多退休年龄对比（当前年龄±5年）
    const baseAge = retireAge
    const ages = [baseAge - 5, baseAge, baseAge + 5].filter(a => a >= 50 && a <= 70)
    const comparison = ages.map(age => {
      const currentYear = new Date().getFullYear()
      const py = Math.max(age - (currentYear - birthYear) + (currentYear - startYear), 15)
      return {
        age,
        ...calcPension({ avgWage: city.avgWage, payYears: py, avgPayIndex, retireAge: age, monthlyBase })
      }
    })

    wx.navigateTo({
      url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify({
        result,
        comparison,
        cityName: city.name,
        retireAge,
        payYears,
        monthlyBase,
        birthYear
      }))}`
    })
  }
})
