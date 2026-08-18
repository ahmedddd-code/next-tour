import { useEffect, useState, type InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: number | undefined;
  onNumberChange: (value: number) => void;
  onClear?: () => void;
};

function withoutLeadingZeros(value: string) {
  if (value === '' || value.startsWith('0.')) return value;
  return value.replace(/^0+(?=\d)/, '');
}

export function NumberInput({ value, onNumberChange, onClear, onBlur, ...props }: Props) {
  const [draft, setDraft] = useState(value === undefined ? '' : String(value));
  useEffect(() => setDraft(value === undefined ? '' : String(value)), [value]);

  return <input {...props} type="number" value={draft} onChange={event => {
    const next = withoutLeadingZeros(event.target.value);
    setDraft(next);
    if (next === '') onClear?.();
    else onNumberChange(Number(next));
  }} onBlur={event => {
    if (draft === '' && value !== undefined) setDraft(String(value));
    onBlur?.(event);
  }}/>;
}
