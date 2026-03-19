const { CITIES } = require('../../data/cities')
const { calcPension } = require('../../utils/calculator')

Page({
  data: {
    mode: 'smart',
    cityNames: CITIES.map(c => c.name),
    cityIndex: 0,
    birthYear: 1985,
    startYear: 2010,
    retireAge: 60,
    monthlyWage: '',
    avgPayIndex: '',
    payYears: 0,
    monthlyBase: 0
  },

  onLoad() {
    this.updateDerived()
  },

  setMode(e) {
    this.setData({ mode: e.currentTarget.dataset.val, avgPayIndex: '', monthlyWage: '' })
  },

  onCityChange(e) {
    this.setData({ cityIndex: +e.detail.value })
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

  onRetireAgeInput(e) {
    const val = parseInt(e.detail.value)
    if (!isNaN(val)) {
      this.setData({ retireAge: val })
      this.updateDerived()
    }
  },

  onMonthlyWageInput(e) {
    const val = parseFloat(e.detail.value)
    const city = CITIES[this.data.cityIndex]
    if (!isNaN(val) && val > 0) {
      const index = Math.round((val / city.avgWage) * 100) / 100
      // 缴费指数范围 0.6~3
      const clampedIndex = Math.min(Math.max(index, 0.6), 3)
      this.setData({ monthlyWage: e.detail.value, avgPayIndex: clampedIndex })
    } else {
      this.setData({ monthlyWage: e.detail.value, avgPayIndex: '' })
    }
  },

  onPayIndexInput(e) {
    this.setData({ avgPayIndex: e.detail.value })
  },

  updateDerived() {
    const { cityIndex, birthYear, startYear, retireAge } = this.data
    const city = CITIES[cityIndex]
    const currentYear = new Date().getFullYear()
    const payYears = Math.max(retireAge - (currentYear - birthYear) + (currentYear - startYear), 15)
    this.setData({ payYears, monthlyBase: city.avgWage })
  },

  calculate() {
    const { cityIndex, retireAge, avgPayIndex, payYears, birthYear, startYear } = this.data
    const city = CITIES[cityIndex]
    const index = parseFloat(avgPayIndex)

    if (!index || index < 0.6 || index > 3) {
      wx.showToast({ title: '缴费指数请填写 0.6~3 之间的数值', icon: 'none' })
      return
    }
    if (!retireAge || retireAge < 50 || retireAge > 70) {
      wx.showToast({ title: '退休年龄请填写 50~70 之间', icon: 'none' })
      return
    }

    const monthlyBase = city.avgWage * index

    const result = calcPension({
      avgWage: city.avgWage,
      payYears,
      avgPayIndex: index,
      retireAge,
      monthlyBase
    })

    // 对比：当前退休年龄 ±5年
    const ages = [retireAge - 5, retireAge, retireAge + 5].filter(a => a >= 50 && a <= 70)
    const comparison = ages.map(age => {
      const currentYear = new Date().getFullYear()
      const py = Math.max(age - (currentYear - birthYear) + (currentYear - startYear), 15)
      return {
        age,
        ...calcPension({ avgWage: city.avgWage, payYears: py, avgPayIndex: index, retireAge: age, monthlyBase })
      }
    })

    wx.navigateTo({
      url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify({
        result, comparison, cityName: city.name, retireAge, payYears, monthlyBase, birthYear
      }))}`
    })
  }
})
