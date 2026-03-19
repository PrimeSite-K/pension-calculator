Page({
  data: {
    gender: 'male',
    birthDate: '1985-01-01',
    workType: 'normal',
    result: null
  },

  setGender(e) {
    const gender = e.currentTarget.dataset.val
    const workType = gender === 'male' ? 'normal' : 'cadre'
    this.setData({ gender, workType, result: null })
  },

  onBirthDateChange(e) {
    this.setData({ birthDate: e.detail.value, result: null })
  },

  setWorkType(e) {
    this.setData({ workType: e.currentTarget.dataset.val, result: null })
  },

  /**
   * 延迟退休计算（2025年1月起实施）
   *
   * 以出生年月为基准：
   * 男性：1965年1月起，每出生4个月延迟1个月，上限延迟36个月（63岁）
   * 女干部：1970年1月起，每出生4个月延迟1个月，上限延迟36个月（58岁）
   * 女工人：1975年1月起，每出生2个月延迟1个月，上限延迟60个月（55岁）
   */
  calcDelayMonths(birthYear, birthMonth, baseYear, baseMonth, delayRate, maxDelay) {
    const birthTotal = birthYear * 12 + birthMonth
    const baseTotal = baseYear * 12 + baseMonth
    if (birthTotal <= baseTotal) return 0
    const diff = birthTotal - baseTotal
    return Math.min(Math.floor(diff / delayRate), maxDelay)
  },

  calculate() {
    const { gender, birthDate, workType } = this.data
    const birth = new Date(birthDate)
    const birthYear = birth.getFullYear()
    const birthMonth = birth.getMonth() + 1

    let baseAge, baseYear, baseMonth, delayRate, maxDelay

    if (gender === 'male') {
      baseAge = 60; baseYear = 1965; baseMonth = 1; delayRate = 4; maxDelay = 36
    } else if (workType === 'cadre') {
      baseAge = 55; baseYear = 1970; baseMonth = 1; delayRate = 4; maxDelay = 36
    } else {
      baseAge = 50; baseYear = 1975; baseMonth = 1; delayRate = 2; maxDelay = 60
    }

    const delayMonths = this.calcDelayMonths(birthYear, birthMonth, baseYear, baseMonth, delayRate, maxDelay)

    // 实际退休年月 = 出生年月 + 原退休年龄（月数）+ 延迟月数
    const totalMonths = birthYear * 12 + birthMonth + baseAge * 12 + delayMonths
    const finalYear = Math.floor(totalMonths / 12)
    const finalMonth = totalMonths % 12 || 12

    // 实际退休年龄（岁+月）
    const totalDelayAge = baseAge * 12 + delayMonths
    const retireAgeYear = Math.floor(totalDelayAge / 12)
    const retireAgeMonth = totalDelayAge % 12
    const retireAgeStr = retireAgeMonth > 0 ? `${retireAgeYear}岁${retireAgeMonth}个月` : `${retireAgeYear}岁`

    const retireDate = `${finalYear}年${finalMonth}月`

    // 距退休时间
    const now = new Date()
    const retireDateObj = new Date(finalYear, finalMonth - 1, 1)
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
      note = delayMonths > 0
        ? `原退休年龄${baseAge}岁，按渐进式延迟退休政策延迟${delayMonths}个月`
        : `出生较早，不受延迟退休政策影响，退休年龄${baseAge}岁`
    }

    this.setData({
      result: { retireAge: retireAgeStr, retireDate, remaining, note }
    })
  }
})
