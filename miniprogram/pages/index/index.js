const { CITIES } = require('../../data/cities')
const { calcPension } = require('../../utils/calculator')

Page({
  data: {
    cityNames: CITIES.map(c => c.name),
    cityIndex: 0,
    gender: 'male',
    birthYear: 1985,
    startYear: 2010,
    wageMultiple: 1,
    retireAge: 60,
    monthlyBase: 0,
    payYears: 0
  },

  onLoad() {
    this.updateDerived()
  },

  updateDerived() {
    const { cityIndex, birthYear, startYear, retireAge, wageMultiple } = this.data
    const city = CITIES[cityIndex]
    const monthlyBase = Math.round(city.avgWage * wageMultiple)
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

  setWageMultiple(e) {
    this.setData({ wageMultiple: +e.currentTarget.dataset.val })
    this.updateDerived()
  },

  setRetireAge(e) {
    this.setData({ retireAge: +e.currentTarget.dataset.val })
    this.updateDerived()
  },

  calculate() {
    const { cityIndex, birthYear, startYear, retireAge, wageMultiple, monthlyBase, payYears } = this.data
    const city = CITIES[cityIndex]
    const avgPayIndex = wageMultiple

    const result = calcPension({
      avgWage: city.avgWage,
      payYears,
      avgPayIndex,
      retireAge,
      monthlyBase
    })

    // 计算多退休年龄对比数据
    const ages = [55, 60, 65]
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
