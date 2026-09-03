import dns from 'dns';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export interface LeadValidationResult {
  isValid: boolean;
  emailValid: boolean;
  phoneValid: boolean;
  cleanName?: string;
  cleanEmail?: string;
  cleanPhone?: string;
  errors: string[];
}

const DISPOSABLE_OR_DUMMY_DOMAINS = new Set([
  'test.com',
  'example.com',
  'example.org',
  'example.net',
  'fake.com',
  'dummy.com',
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
]);

const PLACEHOLDER_USERNAMES = new Set([
  'abc',
  'xyz',
  'test',
  'testing',
  'fake',
  'dummy',
  'none',
  'noemail',
  'asdf',
  'qwerty',
  'sample',
  'example',
  'user',
  'admin',
  'null',
  'na',
  'n/a',
]);

const DUMMY_USERNAME_PATTERN = /^(test|testing|fake|dummy|none|noemail|asdf|qwerty|sample|example|user|admin|null|na|abc|xyz)\d*$/i;

/**
 * Validates an email address syntax, placeholder usernames, disposable domains,
 * and performs a live DNS MX record lookup.
 */
export async function validateEmail(emailRaw?: string): Promise<{ isValid: boolean; error?: string; cleanEmail?: string }> {
  if (!emailRaw || typeof emailRaw !== 'string') {
    return { isValid: false, error: 'Email address was not provided.' };
  }

  const email = emailRaw.trim().toLowerCase();

  // Basic RFC regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: `"${emailRaw.trim()}" is not a complete or valid email address.` };
  }

  const [username, domain] = email.split('@');

  // Never accept single-letter or short usernames (e.g., k@gmail.com, a@..., xy@...)
  if (username.length < 3) {
    return { isValid: false, error: `"${email}" is invalid. Email usernames cannot be a single letter or less than 3 characters.` };
  }

  // Gmail strict policy: personal Gmail addresses must have at least 6 characters
  if ((domain === 'gmail.com' || domain === 'googlemail.com') && username.length < 6) {
    return { isValid: false, error: `"${email}" is invalid. Gmail usernames must be at least 6 characters long.` };
  }

  // Check placeholder usernames (exact or pattern like test1234, abc99)
  if (PLACEHOLDER_USERNAMES.has(username) || DUMMY_USERNAME_PATTERN.test(username)) {
    return { isValid: false, error: `"${username}" appears to be a placeholder or test username. Please provide your real, active email address.` };
  }

  // Check known dummy/disposable domains
  if (DISPOSABLE_OR_DUMMY_DOMAINS.has(domain)) {
    return { isValid: false, error: `"${domain}" is a test or temporary domain. Please provide an active personal or business email.` };
  }

  // Real DNS MX record resolution to check if domain actually receives email
  try {
    const mxRecords = await Promise.race([
      dns.promises.resolveMx(domain),
      new Promise<dns.MxRecord[]>((_, reject) =>
        setTimeout(() => reject(new Error('DNS Timeout')), 2000)
      ),
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      return { isValid: false, error: `The domain "${domain}" does not have valid mail exchange (MX) servers.` };
    }
  } catch (err: any) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return { isValid: false, error: `The email domain "@${domain}" does not exist or cannot receive emails.` };
    }
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com'];
    if (!commonDomains.includes(domain) && err.message !== 'DNS Timeout') {
      return { isValid: false, error: `Could not verify mail servers for "@${domain}".` };
    }
  }

  return { isValid: true, cleanEmail: email };
}

/**
 * Validates a phone number: length, E.164 / US format, and anti-spam / dummy pattern detection.
 */
export function validatePhone(phoneRaw?: string): { isValid: boolean; error?: string; cleanPhone?: string } {
  if (!phoneRaw || typeof phoneRaw !== 'string') {
    return { isValid: false, error: 'Phone number was not provided.' };
  }

  const raw = phoneRaw.trim();

  // Basic check for obvious repeated strings or mashing before parsing
  const digitsOnly = raw.replace(/\D/g, '');
  if (/^(\d)\1+$/.test(digitsOnly)) {
    return { isValid: false, error: 'Phone number consists of repeated identical digits.' };
  }
  const sequentialAscending = '01234567890123456789';
  const sequentialDescending = '98765432109876543210';
  if (digitsOnly.length > 0 && (sequentialAscending.includes(digitsOnly) || sequentialDescending.includes(digitsOnly))) {
    return { isValid: false, error: 'Phone number is a sequential test sequence.' };
  }

  try {
    // Parse using US as default region
    const number = phoneUtil.parseAndKeepRawInput(raw, 'US');
    
    // We only accept valid US numbers
    const isValidUS = phoneUtil.isValidNumberForRegion(number, 'US');
    if (!isValidUS) {
      return { isValid: false, error: 'Only valid US phone numbers are accepted.' };
    }

    // Format in E164 for a clean standard string (e.g. +19098765422)
    const cleanPhone = phoneUtil.format(number, PhoneNumberFormat.E164);
    
    return { isValid: true, cleanPhone };
  } catch (error: any) {
    return { isValid: false, error: `Invalid phone number format: ${error.message || 'Could not parse number'}` };
  }
}

/**
 * Combined lead validator
 */
export async function validateLeadContact(input: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<LeadValidationResult> {
  const errors: string[] = [];

  const emailRes = await validateEmail(input.email);
  if (!emailRes.isValid && emailRes.error) {
    errors.push(emailRes.error);
  }

  const phoneRes = validatePhone(input.phone);
  if (!phoneRes.isValid && phoneRes.error) {
    errors.push(phoneRes.error);
  }

  const cleanName = input.name ? input.name.trim() : undefined;
  if (!cleanName || cleanName.length < 2) {
    errors.push('Please provide the author\'s full name.');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    emailValid: emailRes.isValid,
    phoneValid: phoneRes.isValid,
    cleanName,
    cleanEmail: emailRes.cleanEmail,
    cleanPhone: phoneRes.cleanPhone,
    errors,
  };
}
