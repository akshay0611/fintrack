import { format, parse } from 'date-fns'

export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  })
  return formatter.format(amount)
}

export function formatDate(dateString: string, formatPattern: string): string {
  try {
    // Parse the input date string
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Convert the format pattern from user-friendly format to date-fns format
    const dateFormat = formatPattern
      .replace('DD', 'dd')
      .replace('MM', 'MM')
      .replace('YYYY', 'yyyy');

    return format(date, dateFormat);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

