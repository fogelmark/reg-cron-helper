export function explainCron(expression: string): string {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new Error('Cron expression must have exactly 5 fields (minute hour day month weekday)');
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const explanations: string[] = [];

  // Parse minute
  const minuteExp = explainField(minute, 'minute', 'minutes');

  // Parse hour
  const hourExp = explainField(hour, 'hour', 'hours');

  // Parse day of month
  const dayExp = explainField(dayOfMonth, 'day of month', 'days');

  // Parse month
  const monthExp = explainField(month, 'month', 'months', true);

  // Parse day of week
  const dayOfWeekExp = explainField(dayOfWeek, 'weekday', 'weekdays', false, true);

  // Build human-readable explanation
  let explanation = 'Run ';

  // Special case: every minute
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Run every minute';
  }

  // Time part
  if (minute === '*' && hour === '*') {
    explanation += 'every minute';
  } else if (minute === '*') {
    explanation += `every minute during ${hourExp}`;
  } else if (hour === '*') {
    explanation += `at ${minuteExp} every hour`;
  } else {
    explanation += `at ${hourExp}:${minute.padStart(2, '0')}`;
    if (minute.includes(',') || minute.includes('-') || minute.includes('/')) {
      explanation = `Run at ${minuteExp} during ${hourExp}`;
    }
  }

  // Day/month constraints
  const dayConstraints: string[] = [];

  if (dayOfMonth !== '*') {
    dayConstraints.push(dayExp);
  }

  if (dayOfWeek !== '*') {
    dayConstraints.push(dayOfWeekExp);
  }

  if (month !== '*') {
    dayConstraints.push(monthExp);
  }

  if (dayConstraints.length > 0) {
    explanation += ', ' + dayConstraints.join(', ');
  }

  return explanation;
}

function explainField(
  value: string,
  singular: string,
  plural: string,
  isMonth = false,
  isDayOfWeek = false
): string {
  // Wildcard
  if (value === '*') {
    return `every ${singular}`;
  }

  // Step values (e.g., */15 or 0-23/2)
  if (value.includes('/')) {
    const [range, step] = value.split('/');
    if (range === '*') {
      return `every ${step} ${plural}`;
    } else {
      const rangeExp = explainField(range, singular, plural, isMonth, isDayOfWeek);
      return `every ${step} ${plural} between ${rangeExp}`;
    }
  }

  // Range (e.g., 1-5)
  if (value.includes('-')) {
    const [start, end] = value.split('-');
    const startName = formatValue(start, isMonth, isDayOfWeek);
    const endName = formatValue(end, isMonth, isDayOfWeek);
    return `${startName}-${endName}`;
  }

  // List (e.g., 1,3,5)
  if (value.includes(',')) {
    const values = value.split(',').map(v => formatValue(v, isMonth, isDayOfWeek));
    return values.join(', ');
  }

  // Single value
  return formatValue(value, isMonth, isDayOfWeek);
}

function formatValue(value: string, isMonth: boolean, isDayOfWeek: boolean): string {
  if (isMonth) {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNum = parseInt(value);
    return months[monthNum] || value;
  }

  if (isDayOfWeek) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNum = parseInt(value);
    return days[dayNum] || value;
  }

  return value;
}
