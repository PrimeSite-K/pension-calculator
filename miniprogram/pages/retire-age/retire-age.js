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
   * 延迟退休计算逻辑（2025年1月起实施）
   *
   * 男性：原60岁，每4个月延迟1个月，上限63岁（2040年达到）
   * 女干部：原55岁，每4个月延迟1个月，上限58岁（2040年达到）
   * 女工人：原50岁，每2个月延迟1个月，上限55岁（2035年达到）
   *
   * 计算方式：
   * 1. 先算原始退休日期（出生日期 + 原退休年龄）
   * 2. 若原始退休日期在2025年1月之前 → 不延迟
   * 3. 若在2025年1月之后 → 计算距2025年1月的月数，按节奏算延迟月数
   */
  calcRetireDate(birthYear, birthMonth, baseAge, delayRate, maxDelayMonths) {
    // 原始退休年月
    let origRetireYear = birthYear + baseAge
    let origRetireMonth = birthMonth

    // 政策起始：2025年1月
    const policyStartYear = 2025
    const policyStartMonth = 1

    const origRetireTotal = origRetireYear * 12 + origRetireMonth
    const policyStartTotal = policyStartYear * 12 + policyStartMonth

    let delayMonths = 0
    if (origRetireTotal > policyStartTotal) {
      // 距政策起点的月数
      const monthsAfterPolicy = origRetireTotal - policyStartTotal
      // 每 delayRate 个月延迟1个月
      delayMonths = Math.min(Math.floor(monthsAfterPolicy / delayRate), maxDelayMonths)
    }

    const finalTotal = origRetireTotal + delayMonths
    const finalYear = Math.floor(finalTotal / 12)
    const finalMonth = finalTotal % 12 || 12

    return { finalYear, finalMonth, delayMonths, baseAge }
  },

  calculate() {
    const { gender, birthDate, workType } = this.data
    const birth = new Date(birthDate)
    const birthYear = birth.getFullYear()
    const birthMonth = birth.getMonth() + 1

    let baseAge, delayRate, maxDelayMonths
    if (gender === 'male') {
      baseAge = 60; delayRate = 4; maxDelayMonths = 36  // 最多延3年到63岁
    } else if (workType === 'cadre') {
      baseAge = 55; delayRate = 4; maxDelayMonths = 36  // 最多延3年到58岁
    } else {
      baseAge = 50; delayRate = 2; maxDelayMonths = 60  // 最多延5年到55岁
    }

    const { finalYear, finalMonth, delayMonths } = this.calcRetireDate(
      birthYear, birthMonth, baseAge, delayRate, maxDelayMonths
    )

    const retireAge = baseAge + Math.floor(delayMonths / 12)
    const retireAgeMonth = delayMonths % 12
    const retireAgeStr = retireAgeMonth > 0
      ? `${retireAge}岁${retireAgeMonth}个月`
      : `${retireAge}岁`

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
        : `出生较早，不受延迟退休政策影响`
    }

    this.setData({
      result: { retireAge: retireAgeStr, retireDate, remaining, note }
    })
  }
})
