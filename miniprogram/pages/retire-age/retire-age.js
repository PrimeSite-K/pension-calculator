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

  toMonthIndex(year, month) { return year * 12 + (month - 1) },
  fromMonthIndex(idx) { return { year: Math.floor(idx / 12), month: idx % 12 + 1 } },

  calcDelay(birthYear, birthMonth, baseAge, policyStartYear, policyStartMonth, delayRate, maxDelay) {
    const origIdx = this.toMonthIndex(birthYear + baseAge, birthMonth)
    const policyIdx = this.toMonthIndex(policyStartYear, policyStartMonth)
    if (origIdx <= policyIdx) return 0
    const monthsAfter = origIdx - policyIdx
    const batch = Math.floor(monthsAfter / delayRate)
    return Math.min(batch + 1, maxDelay)
  },

  calculate() {
    const { gender, birthDate, workType } = this.data
    const birth = new Date(birthDate)
    const birthYear = birth.getFullYear()
    const birthMonth = birth.getMonth() + 1

    let baseAge, delayRate, maxDelay
    if (gender === 'male') {
      baseAge = 60; delayRate = 4; maxDelay = 36
    } else if (workType === 'cadre') {
      baseAge = 55; delayRate = 4; maxDelay = 36
    } else {
      baseAge = 50; delayRate = 2; maxDelay = 60
    }

    const delayMonths = this.calcDelay(birthYear, birthMonth, baseAge, 2025, 1, delayRate, maxDelay)
    const finalIdx = this.toMonthIndex(birthYear + baseAge, birthMonth) + delayMonths
    const { year: finalYear, month: finalMonth } = this.fromMonthIndex(finalIdx)

    const ageY = baseAge + Math.floor(delayMonths / 12)
    const ageM = delayMonths % 12
    const retireAgeStr = ageM > 0 ? `${ageY}岁${ageM}个月` : `${ageY}岁`
    const retireDate = `${finalYear}年${finalMonth}月`

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

    this.setData({ result: { baseAge, retireAge: retireAgeStr, retireDate, remaining, note } })
  }
})
