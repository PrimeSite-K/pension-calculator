Page({
  data: {
    gender: 'male',
    birthDate: '1985-01-01',
    workType: 'normal',
    result: null
  },

  setGender(e) {
    this.setData({ gender: e.currentTarget.dataset.val, result: null })
  },

  onBirthDateChange(e) {
    this.setData({ birthDate: e.detail.value, result: null })
  },

  setWorkType(e) {
    this.setData({ workType: e.currentTarget.dataset.val, result: null })
  },

  calculate() {
    const { gender, birthDate, workType } = this.data
    const birth = new Date(birthDate)
    const birthYear = birth.getFullYear()
    const birthMonth = birth.getMonth() + 1

    // 法定退休年龄
    let retireAge = 60
    if (workType === 'normal') {
      if (gender === 'male') retireAge = 60
      else retireAge = 55 // 干部/默认女性55岁
    } else if (workType === 'special') {
      retireAge = gender === 'male' ? 55 : 45
    } else if (workType === 'flexible') {
      retireAge = gender === 'male' ? 60 : 55
    }

    // 2025年渐进式延迟退休（简化处理：1955年后出生每3年延迟1个月）
    let delayMonths = 0
    if (birthYear >= 1955) {
      const baseYear = workType === 'special' ? 1970 : 1965
      if (birthYear >= baseYear) {
        delayMonths = Math.min(Math.floor((birthYear - baseYear) * 12 / 36), 36)
      }
    }

    const retireYear = birthYear + retireAge
    const retireMonth = birthMonth + delayMonths
    const adjustedYear = retireYear + Math.floor((retireMonth - 1) / 12)
    const adjustedMonth = ((retireMonth - 1) % 12) + 1

    const retireDate = `${adjustedYear}年${adjustedMonth}月`

    // 距退休时间
    const now = new Date()
    const retireDateObj = new Date(adjustedYear, adjustedMonth - 1, 1)
    const diffMs = retireDateObj - now
    let remaining = ''
    let note = ''

    if (diffMs <= 0) {
      remaining = '已达到退休年龄'
      note = '您已达到法定退休年龄，可办理退休手续'
    } else {
      const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))
      const years = Math.floor(diffMonths / 12)
      const months = diffMonths % 12
      remaining = years > 0 ? `${years}年${months}个月` : `${months}个月`
      note = delayMonths > 0 ? `已按渐进式延迟退休政策延迟${delayMonths}个月` : '按现行政策计算'
    }

    this.setData({
      result: { retireAge, retireDate, remaining, note }
    })
  }
})
