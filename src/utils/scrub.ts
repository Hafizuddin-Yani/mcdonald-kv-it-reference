/**
 * PII guard: reporter names and phone numbers must never leave the browser.
 * Search, export and insights never include reporter fields, and this is the
 * single place that substitutes placeholders when building shared data files.
 */
export function scrubReporter(): { name: string; phone: string } {
  return { name: 'Store Manager', phone: '01X-XXX XXXX' };
}
