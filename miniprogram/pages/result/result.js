Page({
  data: {
    result: {},
    comparison: [],
    cityName: '',
    retireAge: 60,
    payYears: 0,
    monthlyBase: 0,
    basicRatio: 50,
    personalRatio: 50
  },

  onLoad(options) {
    const data = JSON.parse(decodeURIComponent(options.data))
    const { result, comparison, cityName, retireAge, payYears, monthlyBase } = data

    // 计算构成比例
    const total = result.basicPension + result.personalPension
    const basicRatio = Math.round((result.basicPension / total) * 100)
    const personalRatio = 100 - basicRatio

    // 计算对比柱状图宽度
    const maxAmount = Math.max(...comparison.map(c => c.totalMonthly))
    const comparisonWithBar = comparison.map(c => ({
      ...c,
      barWidth: Math.round((c.totalMonthly / maxAmount) * 100)
    }))

    this.setData({
      result,
      comparison: comparisonWithBar,
      cityName,
      retireAge,
      payYears,
      monthlyBase,
      basicRatio,
      personalRatio
    })
  },

  watchAd() {
    wx.showLoading({ title: '加载广告...' })
    wx.createRewardedVideoAd({
      adUnitId: 'adunit-xxxxxxxxxxxxxxxx' // 替换为真实广告单元ID
    }).then(ad => {
      wx.hideLoading()
      ad.show().then(() => {
        ad.onClose(res => {
          if (res && res.isEnded) {
            // 用户看完广告，跳转详情页
            wx.navigateTo({
              url: `/pages/detail/detail?data=${encodeURIComponent(JSON.stringify({
                result: this.data.result,
                comparison: this.data.comparison,
                cityName: this.data.cityName,
                retireAge: this.data.retireAge,
                payYears: this.data.payYears,
                monthlyBase: this.data.monthlyBase
              }))}`
            })
          } else {
            wx.showToast({ title: '请看完广告后解锁', icon: 'none' })
          }
        })
      })
    }).catch(() => {
      wx.hideLoading()
      // 广告加载失败，直接跳转（开发阶段）
      wx.navigateTo({
        url: `/pages/detail/detail?data=${encodeURIComponent(JSON.stringify({
          result: this.data.result,
          comparison: this.data.comparison,
          cityName: this.data.cityName,
          retireAge: this.data.retireAge,
          payYears: this.data.payYears,
          monthlyBase: this.data.monthlyBase
        }))}`
      })
    })
  },

  recalc() {
    wx.navigateBack()
  }
})
