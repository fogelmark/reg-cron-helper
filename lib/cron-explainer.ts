export function explainCron(expression: string): string {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new Error('Cron-uttrycket måste ha exakt 5 fält (minut timme dag månad veckodag)');
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const explanations: string[] = [];

  // Parse minute
  const minuteExp = explainField(minute, 'minut', 'minuter');

  // Parse hour
  const hourExp = explainField(hour, 'timme', 'timmar');

  // Parse day of month
  const dayExp = explainField(dayOfMonth, 'dag i månaden', 'dagar');

  // Parse month
  const monthExp = explainField(month, 'månad', 'månader', true);

  // Parse day of week
  const dayOfWeekExp = explainField(dayOfWeek, 'veckodag', 'veckodagar', false, true);

  // Build human-readable explanation
  let explanation = 'Kör ';

  // Special case: every minute
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Kör varje minut';
  }

  // Time part
  if (minute === '*' && hour === '*') {
    explanation += 'varje minut';
  } else if (minute === '*') {
    explanation += `varje minut under ${hourExp}`;
  } else if (hour === '*') {
    explanation += `${minuteExp} varje timme`;
  } else {
    explanation += `kl ${hourExp}:${minute.padStart(2, '0')}`;
    if (minute.includes(',') || minute.includes('-') || minute.includes('/')) {
      explanation = `Kör ${minuteExp} under ${hourExp}`;
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
    return `varje ${singular}`;
  }

  // Step values (e.g., */15 or 0-23/2)
  if (value.includes('/')) {
    const [range, step] = value.split('/');
    if (range === '*') {
      return `var ${step}:e ${singular}`;
    } else {
      const rangeExp = explainField(range, singular, plural, isMonth, isDayOfWeek);
      return `var ${step}:e ${singular} mellan ${rangeExp}`;
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
    const months = ['', 'januari', 'februari', 'mars', 'april', 'maj', 'juni',
                    'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
    const monthNum = parseInt(value);
    return months[monthNum] || value;
  }

  if (isDayOfWeek) {
    const days = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
    const dayNum = parseInt(value);
    return days[dayNum] || value;
  }

  return value;
}
