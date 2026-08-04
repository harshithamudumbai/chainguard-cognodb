export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}
