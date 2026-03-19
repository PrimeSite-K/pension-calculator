const CITIES = [
  { name: '北京', avgWage: 11082 },
  { name: '上海', avgWage: 12183 },
  { name: '深圳', avgWage: 11620 },
  { name: '广州', avgWage: 9346 },
  { name: '杭州', avgWage: 9468 },
  { name: '南京', avgWage: 8736 },
  { name: '苏州', avgWage: 8512 },
  { name: '宁波', avgWage: 8234 },
  { name: '厦门', avgWage: 7892 },
  { name: '成都', avgWage: 7580 },
  { name: '武汉', avgWage: 7423 },
  { name: '天津', avgWage: 7408 },
  { name: '长沙', avgWage: 7218 },
  { name: '济南', avgWage: 7234 },
  { name: '青岛', avgWage: 7156 },
  { name: '合肥', avgWage: 7106 },
  { name: '西安', avgWage: 6882 },
  { name: '重庆', avgWage: 6939 },
  { name: '郑州', avgWage: 6754 },
  { name: '全国平均', avgWage: 6539 }
]

// 计发月数（按退休年龄）
const PAYMENT_MONTHS = {
  50: 195,
  55: 170,
  60: 139,
  65: 101
}

module.exports = { CITIES, PAYMENT_MONTHS }
