import styles from './HotelDetailPage.module.css'
import { applyPaymentMask } from './paymentMasks'
import type { PaymentFormData } from './types'

interface PaymentModalProps {
  paymentData: PaymentFormData
  paymentError: string | null
  paymentLoading: boolean
  onClose: () => void
  onFieldChange: (field: keyof PaymentFormData, value: string) => void
  onConfirm: () => void
}

export const PaymentModal = ({
  paymentData,
  paymentError,
  paymentLoading,
  onClose,
  onFieldChange,
  onConfirm,
}: PaymentModalProps) => {
  const handleFieldChange = (field: keyof PaymentFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(field, applyPaymentMask(field, event.target.value))
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.paymentModal}`}>
        <button onClick={onClose} className={styles.closeModalButton} disabled={paymentLoading}>
          &times;
        </button>
        <h3>Введите номер карты</h3>
        <div className={styles.paymentForm}>
          <div className={styles.paymentField}>
            <label htmlFor="payment-card-number">Номер карты</label>
            <input
              id="payment-card-number"
              type="text"
              name="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              value={paymentData.cardNumber}
              onChange={handleFieldChange('cardNumber')}
            />
          </div>
          <div className={styles.paymentRow}>
            <div className={styles.paymentField}>
              <label htmlFor="payment-expiry-date">Срок действия</label>
              <input
                id="payment-expiry-date"
                type="text"
                name="expiryDate"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                maxLength={5}
                value={paymentData.expiryDate}
                onChange={handleFieldChange('expiryDate')}
              />
            </div>
            <div className={styles.paymentField}>
              <label htmlFor="payment-cvv">CVV</label>
              <input
                id="payment-cvv"
                type="text"
                name="cvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="000"
                maxLength={3}
                value={paymentData.cvv}
                onChange={handleFieldChange('cvv')}
              />
            </div>
          </div>
          {paymentError && <p className={styles.disabledMessage}>{paymentError}</p>}
          <button className={styles.paymentSubmitButton} onClick={onConfirm} disabled={paymentLoading}>
            {paymentLoading ? 'Подтверждение...' : 'Оплатить'}
          </button>
        </div>
      </div>
    </div>
  )
}
