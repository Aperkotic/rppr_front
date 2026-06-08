import type { PaymentFormData } from './types'

const CARD_DIGITS_LENGTH = 16
const CVV_LENGTH = 3

export function maskCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, CARD_DIGITS_LENGTH)
  const groups: string[] = []

  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4))
  }

  return groups.join(' ')
}

export function maskExpiryDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)

  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function maskCvv(value: string): string {
  return value.replace(/\D/g, '').slice(0, CVV_LENGTH)
}

export function applyPaymentMask(field: keyof PaymentFormData, value: string): string {
  switch (field) {
    case 'cardNumber':
      return maskCardNumber(value)
    case 'expiryDate':
      return maskExpiryDate(value)
    case 'cvv':
      return maskCvv(value)
    default:
      return value
  }
}

export function isPaymentFormComplete(data: PaymentFormData): boolean {
  const cardDigits = data.cardNumber.replace(/\D/g, '')
  const expiryDigits = data.expiryDate.replace(/\D/g, '')
  const month = Number(expiryDigits.slice(0, 2))
  const cvvDigits = data.cvv.replace(/\D/g, '')

  return (
    cardDigits.length === CARD_DIGITS_LENGTH &&
    expiryDigits.length === 4 &&
    month >= 1 &&
    month <= 12 &&
    cvvDigits.length === CVV_LENGTH
  )
}
