type RelativeTimeUnit = 'day' | 'hour' | 'minute' | 'second';

const RelativeTimeFormatConstructor = globalThis.Intl?.RelativeTimeFormat;
const relativeTimeFormatter = RelativeTimeFormatConstructor
  ? new RelativeTimeFormatConstructor('en', {
      numeric: 'auto',
    })
  : null;

function formatRelativeTimeFallback(value: number, unit: RelativeTimeUnit) {
  const absoluteValue = Math.abs(value);
  const unitLabel = absoluteValue === 1 ? unit : `${unit}s`;

  if (absoluteValue === 0) {
    return 'just now';
  }

  if (value < 0) {
    return `${absoluteValue} ${unitLabel} ago`;
  }

  return `in ${absoluteValue} ${unitLabel}`;
}

function formatWithBestAvailableFormatter(value: number, unit: RelativeTimeUnit) {
  if (relativeTimeFormatter) {
    return relativeTimeFormatter.format(value, unit);
  }

  return formatRelativeTimeFallback(value, unit);
}

export function formatRelativeTime(dateInput: string) {
  const targetTime = new Date(dateInput).getTime();
  const now = Date.now();
  const diffInSeconds = Math.round((targetTime - now) / 1000);
  const absoluteSeconds = Math.abs(diffInSeconds);

  if (absoluteSeconds < 60) {
    return formatWithBestAvailableFormatter(diffInSeconds, 'second');
  }

  const diffInMinutes = Math.round(diffInSeconds / 60);

  if (Math.abs(diffInMinutes) < 60) {
    return formatWithBestAvailableFormatter(diffInMinutes, 'minute');
  }

  const diffInHours = Math.round(diffInMinutes / 60);

  if (Math.abs(diffInHours) < 24) {
    return formatWithBestAvailableFormatter(diffInHours, 'hour');
  }

  const diffInDays = Math.round(diffInHours / 24);

  if (Math.abs(diffInDays) < 7) {
    return formatWithBestAvailableFormatter(diffInDays, 'day');
  }

  return new Date(dateInput).toLocaleDateString();
}
