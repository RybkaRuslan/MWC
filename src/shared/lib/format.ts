export const formatNumber = (value: number, fractionDigits = 3) =>
  Number.isInteger(value)
    ? String(value)
    : value.toFixed(fractionDigits).replace('.', ',')

export const parseNumber = (value: string, fallback: number) => {
  const parsed = parseFloat(value.replace(',', '.'))
  return Number.isNaN(parsed) ? fallback : parsed
}
