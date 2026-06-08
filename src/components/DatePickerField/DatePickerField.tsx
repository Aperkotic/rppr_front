import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import './setupDatePicker'
import { parseIsoDate } from '../../utils/datePicker'
import { DateFilterInput } from './DateFilterInput'
import styles from './DatePickerField.module.css'

interface DatePickerFieldProps {
  value: string
  onChange: (value: string) => void
  minDate?: Date | null
  placeholder?: string
  title?: string
  inputClassName?: string
  wrapperClassName?: string
  popperClassName?: string
  id?: string
}

export const DatePickerField = ({
  value,
  onChange,
  minDate,
  placeholder = 'Выберите дату',
  title,
  inputClassName,
  wrapperClassName,
  popperClassName = 'datePickerPopper',
  id,
}: DatePickerFieldProps) => (
  <DatePicker
    id={id}
    selected={parseIsoDate(value)}
    onChange={(date: Date | null) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
    minDate={minDate ?? undefined}
    dateFormat="dd.MM.yyyy"
    locale="ru"
    placeholderText={placeholder}
    popperPlacement="bottom-start"
    popperProps={{ strategy: 'fixed' }}
    customInput={
      <DateFilterInput
        title={title ?? placeholder}
        placeholder={placeholder}
        className={inputClassName}
      />
    }
    wrapperClassName={wrapperClassName ?? styles.wrapper}
    calendarClassName="datePickerCalendar"
    popperClassName={popperClassName}
  />
)
