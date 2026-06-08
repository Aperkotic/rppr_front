import { forwardRef } from 'react';

interface DateFilterInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title: string;
}

export const DateFilterInput = forwardRef<HTMLInputElement, DateFilterInputProps>(
  ({ title, placeholder, className, value, onClick }, ref) => (
    <input
      ref={ref}
      value={value}
      onClick={onClick}
      readOnly
      title={title}
      placeholder={placeholder}
      className={className}
    />
  ),
);

DateFilterInput.displayName = 'DateFilterInput';
