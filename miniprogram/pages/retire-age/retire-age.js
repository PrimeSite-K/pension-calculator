Page({
  data: {
    gender: 'male',
    birthDate: '1985-01-01',
    workType: 'normal',
    result: null
  },

  setGender(e) {
    const gender = e.currentTarget.dataset.val
    // 切换性别时重置工作类型
    const workType = gender === 'male' ? 'normal' : 'cadre'
    this.setData({ gender, workType, result: null })
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
    if (gender === 'male') {
      retireAge = 60
    } else {
      retireAge = workType === 'cadre' ? 55 : 50
    }

    // 2025年渐进式延迟退休（简化：每4个月出生延迟1个月，最多延迟3年）
    const now = new Date()
    const currentYear = now.getFullYear()
    let delayMonths = 0
    if (currentYear >= 2025) {
      const baseYear = gender === 'male' ? 1965 : (workType === 'cadre' ? 1970 : 1975)
      if (birthYear >= baseYear) {
        delayMonths = Math.min(Math.floor((birthYear * 12 + birthMonth - (baseYear * 12)) / 4), 36)
      }
    }

    const totalRetireMonths = birthYear * 12 + birthMonth + retireAge * 12 + delayMonths
    const adjustedYear = Math.floor(totalRetireMonths / 12)
    const adjustedMonth = totalRetireMonths % 12 || 12

    const retireDate = `${adjustedYear}年${adjustedMonth}月`

    // 距退休时间
    const retireDateObj = new Date(adjustedYear, adjustedMonth - 1, 1)
    const diffMs = retireDateObj - now
    let remaining = ''
    let note = ''

    if (diffMs <= 0) {
      remaining = '已达到退休年龄'
      note = '您已达到法定退休年龄，可办理退休手续'
    } else {
      const diffMonths = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.44))
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
