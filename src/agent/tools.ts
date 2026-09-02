import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import LeadModel from '@/models/Lead';
import { triggerOutboundCall } from '@/lib/elevenlabs';

/**
 * Strict US Phone Validator (NANP: 10 digits, area code 2-9, exchange code 2-9)
 */
export function validateUSPhoneNumber(phone: string): { isValid: boolean; cleanPhone?: string; error?: string } {
  if (!phone) return { isValid: false, error: 'Phone number is required.' };
  
  const trimmed = phone.trim();
  
  // Explicitly reject international numbers that start with '+' but aren't US '+1'
  if (trimmed.startsWith('+') && !trimmed.startsWith('+1')) {
    return {
      isValid: false,
      error: `International numbers are not accepted. Only US numbers are allowed (e.g., +1 404-555-0199).`,
    };
  }

  let digits = phone.replace(/\D/g, '');
  
  // Handle leading US country code '1'
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  
  if (digits.length !== 10) {
    return {
      isValid: false,
      error: `Invalid phone length (${digits.length} digits). US phone numbers must be exactly 10 digits (e.g. 404-555-0199).`,
    };
  }

  // Area code cannot start with 0 or 1
  if (digits[0] === '0' || digits[0] === '1') {
    return {
      isValid: false,
      error: `Invalid US area code (${digits.slice(0, 3)}). US area codes cannot start with 0 or 1.`,
    };
  }

  // Exchange code cannot start with 0 or 1
  if (digits[3] === '0' || digits[3] === '1') {
    return {
      isValid: false,
      error: `Invalid US exchange code (${digits.slice(3, 6)}). Central office code cannot start with 0 or 1.`,
    };
  }

  // Reject fictitious exchange code '555'
  if (digits.slice(3, 6) === '555') {
    return {
      isValid: false,
      error: `Invalid phone number. '555' is a fictitious exchange code often used in movies/TV.`,
    };
  }

  // Reject identical repeating digits (e.g., 222-222-2222)
  if (/^(\d)\1{9}$/.test(digits)) {
    return {
      isValid: false,
      error: `Invalid phone number. Repeating digits are not accepted.`,
    };
  }

  // Reject sequential digits
  if (digits === '1234567890' || digits === '2345678901' || digits === '0987654321') {
    return {
      isValid: false,
      error: `Invalid phone number. Sequential digits are not accepted.`,
    };
  }

  // Return standard E.164 format for better compatibility with telephony APIs
  return { isValid: true, cleanPhone: `+1${digits}` };
}

/**
 * Strict Email Validator
 */
export function validateEmail(email: string): { isValid: boolean; cleanEmail?: string; error?: string } {
  if (!email) return { isValid: false, error: 'Email address is required.' };
  
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: `Invalid email format "${email}". A valid email must contain '@' and a proper domain (e.g. name@gmail.com).`,
    };
  }

  return { isValid: true, cleanEmail: trimmed };
}

/**
 * Tool: Save or update lead details in MongoDB CRM
 */
export const saveLeadInfoTool = tool(
  async ({ fullName, email, phoneNumber, bookTopic, writingStage, preferredContactTime, notes }) => {
    try {
      // 1. Strict Email Validation (if provided)
      let validEmail: string | undefined = undefined;
      if (email) {
        const emailCheck = validateEmail(email);
        if (!emailCheck.isValid) {
          console.warn(`⚠️ [Agent Tool Validation] Rejected invalid email: ${email}`);
          return JSON.stringify({ 
            success: false, 
            validationError: true, 
            field: 'email',
            error: emailCheck.error 
          });
        }
        validEmail = emailCheck.cleanEmail;
      }

      // 2. Strict US Phone Validation (if provided)
      let validPhone: string | undefined = undefined;
      if (phoneNumber) {
        const phoneCheck = validateUSPhoneNumber(phoneNumber);
        if (!phoneCheck.isValid) {
          console.warn(`⚠️ [Agent Tool Validation] Rejected invalid US phone: ${phoneNumber}`);
          return JSON.stringify({ 
            success: false, 
            validationError: true, 
            field: 'phoneNumber',
            error: phoneCheck.error 
          });
        }
        validPhone = phoneCheck.cleanPhone;
      }

      // If neither valid email nor valid phone was provided, reject saving
      if (!validEmail && !validPhone && !bookTopic && !writingStage && !preferredContactTime) {
        return JSON.stringify({
          success: false,
          validationError: true,
          error: 'Must provide at least a valid US phone number, valid email, or preferred contact time.',
        });
      }

      await connectDB();

      const names = (fullName || 'Prospective Author').trim().split(' ');
      const firstName = names[0] || 'Author';
      const lastName = names.slice(1).join(' ') || '';

      const timeContext = preferredContactTime ? `Preferred Contact Time: ${preferredContactTime}. ` : '';
      const fullNotes = `${timeContext}${notes || ''}`.trim() || 'Captured via Alex Chat Agent';

      // Upsert lead based on phone number or email
      let existingLead = null;
      if (validPhone) {
        existingLead = await LeadModel.findOne({ phoneNumber: { $regex: validPhone.slice(-10) + '$' } });
      } else if (validEmail) {
        existingLead = await LeadModel.findOne({ email: validEmail });
      }

      if (existingLead) {
        if (firstName && firstName !== 'Author') existingLead.firstName = firstName;
        if (lastName) existingLead.lastName = lastName;
        if (validEmail) existingLead.email = validEmail;
        if (validPhone) existingLead.phoneNumber = validPhone;
        if (bookTopic) existingLead.bookTopic = bookTopic;
        if (writingStage) existingLead.writingStage = writingStage;
        if (preferredContactTime) {
          existingLead.context = `${timeContext}${existingLead.context || ''}`.trim();
        }
        if (notes) {
          existingLead.context = existingLead.context ? `${existingLead.context}\n${notes}` : notes;
        }
        await existingLead.save();
        console.log(`✅ [Agent Tool] Lead updated in MongoDB: ${existingLead.firstName} (${existingLead._id})`);
        return JSON.stringify({ 
          success: true, 
          message: 'Lead updated successfully', 
          leadId: existingLead._id,
          savedDetails: { email: validEmail, phoneNumber: validPhone, firstName, preferredContactTime }
        });
      } else {
        const newLead = await LeadModel.create({
          firstName,
          lastName,
          phoneNumber: validPhone || 'Pending',
          email: validEmail,
          bookTopic: bookTopic || '',
          writingStage: writingStage || 'idea',
          context: fullNotes,
          source: 'chat_agent',
          status: 'new',
        });
        console.log(`✅ [Agent Tool] New lead saved to MongoDB: ${newLead.firstName} (${newLead._id})`);
        return JSON.stringify({ 
          success: true, 
          message: 'Lead created successfully', 
          leadId: newLead._id,
          savedDetails: { email: validEmail, phoneNumber: validPhone, firstName, preferredContactTime }
        });
      }
    } catch (error: any) {
      console.error('❌ [Agent Tool] Error saving lead info:', error.message);
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: 'save_lead_info',
    description: 'Saves or updates author details in the CRM. Validates that email is a valid email (e.g. name@domain.com) and phone is a valid 10-digit US number (no international/foreign numbers).',
    schema: z.object({
      fullName: z.string().optional().describe('Full name of the author/visitor'),
      email: z.string().optional().describe('Valid email address (e.g. user@gmail.com)'),
      phoneNumber: z.string().optional().describe('Valid 10-digit US phone or mobile number (NANP 10 digits)'),
      bookTopic: z.string().optional().describe('Book genre, concept, title, or topic'),
      writingStage: z.string().optional().describe('Writing stage: idea, drafting, completed manuscript, or published'),
      preferredContactTime: z.string().optional().describe('Preferred day or time for Elizabeth to call the author (e.g. "tomorrow 2pm EST", "Friday morning")'),
      notes: z.string().optional().describe('Additional notes or service gaps discussed'),
    }),
  }
);

/**
 * Tool: Trigger ElevenLabs Outbound Phone Call
 */
export const triggerOutboundCallTool = tool(
  async ({ phoneNumber, authorName, notes }) => {
    try {
      console.log(`📞 [Agent Tool] Triggering outbound ElevenLabs call for: ${authorName || 'Author'} at ${phoneNumber}`);
      
      const phoneCheck = validateUSPhoneNumber(phoneNumber);
      if (!phoneCheck.isValid) {
        return JSON.stringify({ 
          success: false, 
          validationError: true, 
          error: phoneCheck.error || 'Must be a valid 10-digit US phone number.' 
        });
      }

      const formattedPhone = `+1${phoneCheck.cleanPhone}`;

      const callResult = await triggerOutboundCall(formattedPhone, {
        first_name: authorName || 'Author',
        notes: notes || 'Requested live call from website chat agent.',
      });

      if (callResult.success) {
        return JSON.stringify({
          success: true,
          message: `Phone call initiated successfully to ${formattedPhone}`,
          conversationId: callResult.conversation_id,
        });
      } else {
        return JSON.stringify({
          success: false,
          error: callResult.error || 'Failed to connect call via ElevenLabs',
        });
      }
    } catch (error: any) {
      console.error('❌ [Agent Tool] Error triggering outbound call:', error.message);
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: 'trigger_outbound_call',
    description: 'Initiates an immediate live phone call to the author via the ElevenLabs voice agent when the user explicitly asks for a phone call. Phone MUST be a valid 10-digit US number.',
    schema: z.object({
      phoneNumber: z.string().describe('The destination 10-digit US phone number to dial'),
      authorName: z.string().optional().describe('First or full name of the author'),
      notes: z.string().optional().describe('Short context or summary of what they want to discuss on the call'),
    }),
  }
);

export const sendEmailTool = tool(
  async ({ emailAddress, authorName }) => {
    try {
      console.log(`📧 [Agent Tool] Triggering email proposal for: ${authorName || 'Author'} at ${emailAddress}`);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailAddress,
          name: authorName,
          price_visible: false // Hidden by default when sent via agent
        })
      });

      const data = await response.json();

      if (data.success) {
        return JSON.stringify({
          success: true,
          message: `Email proposal sent successfully to ${emailAddress} (with prices hidden)`,
        });
      } else {
        return JSON.stringify({
          success: false,
          error: data.message || 'Failed to send email proposal',
        });
      }
    } catch (error: any) {
      console.error('❌ [Agent Tool] Error sending email:', error.message);
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: 'send_email_proposal',
    description: 'Sends the official publishing proposal and plans via email to the author. MUST ONLY be called if the author explicitly asks for the plans/proposal to be sent to their email. Prices are hidden by default.',
    schema: z.object({
      emailAddress: z.string().describe('The destination email address to send the proposal to'),
      authorName: z.string().optional().describe('First or full name of the author'),
    }),
  }
);

export const AGENT_TOOLS = [saveLeadInfoTool, triggerOutboundCallTool, sendEmailTool];

