import { StudentLeadRequest } from '../types';

export interface WhatsAppMessagePayload {
  phoneNumber: string;
  messageText: string;
  leadId?: string;
  apiEndpointUrl?: string; // Optional custom webhook / WhatsApp API gateway
  apiKey?: string;         // Optional API Key / Bearer token
}

export interface WhatsAppSendResult {
  success: boolean;
  mode: 'direct_web_api' | 'custom_webhook_api';
  dispatchedAt: string;
  waLink: string;
  message: string;
}

export const WhatsAppService = {
  /**
   * Sanitizes phone number to international standard (digits only, removing leading 0, plus signs, dashes, spaces)
   */
  formatInternationalPhone(rawPhone: string, defaultCountryCode = '92'): string {
    if (!rawPhone) return '';
    let cleaned = rawPhone.replace(/[^0-9]/g, '');

    // If starts with 00, replace with nothing (standard international prefix)
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.slice(2);
    }
    // If starts with single 0 (local mobile e.g., 03001234567), prepend country code (e.g. 923001234567)
    else if (cleaned.startsWith('0') && cleaned.length >= 10 && cleaned.length <= 12) {
      cleaned = `${defaultCountryCode}${cleaned.slice(1)}`;
    }
    // If number doesn't have country code (less than 10 digits or no prefix)
    else if (cleaned.length === 10 && !cleaned.startsWith('92') && !cleaned.startsWith('44') && !cleaned.startsWith('1')) {
      cleaned = `${defaultCountryCode}${cleaned}`;
    }

    return cleaned;
  },

  /**
   * Generates WhatsApp Click-to-Chat & Universal API Link
   * Works on Desktop WhatsApp, Web WhatsApp, and Mobile WhatsApp without cost.
   */
  generateWhatsAppLink(rawPhone: string, messageText: string): string {
    const formattedNumber = this.formatInternationalPhone(rawPhone);
    const encodedText = encodeURIComponent(messageText);
    if (!formattedNumber) {
      return `https://api.whatsapp.com/send?text=${encodedText}`;
    }
    return `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedText}`;
  },

  /**
   * Dispatches WhatsApp message:
   * 1. If custom API webhook is provided, attempts backend HTTP POST call.
   * 2. Always generates and opens the official WhatsApp API direct transmission window (or wa.me).
   */
  async sendWhatsAppMessage({
    phoneNumber,
    messageText,
    leadId,
    apiEndpointUrl,
    apiKey,
  }: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    const cleanedNumber = this.formatInternationalPhone(phoneNumber);
    const waLink = this.generateWhatsAppLink(cleanedNumber, messageText);
    const timestamp = new Date().toISOString();

    // If custom API URL provided (e.g. Meta WhatsApp Cloud API / CallMeBot / custom proxy)
    if (apiEndpointUrl && apiEndpointUrl.trim().startsWith('http')) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (apiKey) {
          headers['Authorization'] = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
        }

        const res = await fetch(apiEndpointUrl.trim(), {
          method: 'POST',
          headers,
          body: JSON.stringify({
            phone: cleanedNumber,
            to: cleanedNumber,
            message: messageText,
            lead_id: leadId,
            timestamp,
          }),
        });

        if (res.ok) {
          return {
            success: true,
            mode: 'custom_webhook_api',
            dispatchedAt: timestamp,
            waLink,
            message: `Message dispatched via custom WhatsApp API webhook to +${cleanedNumber}`,
          };
        }
      } catch (err) {
        console.warn('Custom WhatsApp Webhook API error, falling back to direct WhatsApp API:', err);
      }
    }

    // Direct Instant WhatsApp API Launch
    if (typeof window !== 'undefined') {
      window.open(waLink, '_blank', 'noopener,noreferrer');
    }

    return {
      success: true,
      mode: 'direct_web_api',
      dispatchedAt: timestamp,
      waLink,
      message: `WhatsApp message initiated for +${cleanedNumber}. Pre-filled message opened in WhatsApp chat!`,
    };
  },

  /**
   * Generates Ready-Made WhatsApp Message Templates tailored for Student Leads
   */
  getTemplateMessage(templateType: string, lead: StudentLeadRequest): string {
    const counselorName = lead.counselor_name || 'Admissions Counselor';
    const franchiseName = lead.franchise_name || 'Study World Consultant';

    switch (templateType) {
      case 'lead_summary':
      case 'welcome_assessment':
        return (
          `*🎓 STUDY WORLD CONSULTANT - ADMISSIONS UPDATE*\n\n` +
          `Dear *${lead.student_name}*,\n\n` +
          `Greetings from *${franchiseName}*!\n\n` +
          `We have evaluated your academic profile for your desired university admission:\n` +
          `🏛️ *Institution:* ${lead.university_name}\n` +
          `📖 *Program:* ${lead.course_name}\n` +
          `📍 *Destination:* ${lead.destination_country} (${lead.city || 'Campus'})\n` +
          `💵 *Estimated Tuition:* ${lead.currency} ${lead.tuition_fee?.toLocaleString() || 'N/A'}\n` +
          `📅 *Target Intake:* ${lead.intake || 'Upcoming Intake'}\n` +
          `📊 *Current Status:* ${lead.status}\n\n` +
          `*Next Steps:* Please share your latest academic transcripts, passport copy, and English proficiency score (IELTS/PTE/Duolingo) so we can proceed with your application.\n\n` +
          `Feel free to reply directly to this WhatsApp chat.\n\n` +
          `Best regards,\n` +
          `*${counselorName}*\n` +
          `*Study World Consultant Global Admissions Team*`
        );

      case 'docs_reminder':
        return (
          `*⚠️ DOCUMENTATION REQUIRED FOR ADMISSION*\n\n` +
          `Dear *${lead.student_name}*,\n\n` +
          `To finalize your application for *${lead.course_name}* at *${lead.university_name}*, we require the following pending documents:\n\n` +
          `1️⃣ High School / Degree Transcripts & Certificates\n` +
          `2️⃣ Valid Passport Copy (Front & Back Bio Pages)\n` +
          `3️⃣ English Language Test Score (IELTS / PTE / MOI Certificate)\n` +
          `4️⃣ Updated CV / Resume & Statement of Purpose\n\n` +
          `You can reply and attach the PDF documents directly on this WhatsApp number.\n\n` +
          `Warm regards,\n` +
          `*${counselorName}* • ${franchiseName}`
        );

      case 'meet_consultation':
        return (
          `*📅 COUNSELING SESSION CONFIRMATION*\n\n` +
          `Dear *${lead.student_name}*,\n\n` +
          `Your 1-on-1 higher education consultation with *Study World Consultant* is confirmed.\n\n` +
          `🎯 *Topic:* Course Selection, Scholarships & Visa Process for *${lead.destination_country}*\n` +
          `${lead.meet_link ? `🔗 *Google Meet Link:* ${lead.meet_link}\n` : ''}` +
          `👤 *Assigned Counselor:* ${counselorName}\n\n` +
          `Please ensure you have a stable internet connection. Looking forward to speaking with you!\n\n` +
          `Best regards,\n` +
          `*${counselorName}*`
        );

      case 'offer_letter_congrats':
        return (
          `*🎉 CONGRATULATIONS ON YOUR CONDITIONAL OFFER!*\n\n` +
          `Dear *${lead.student_name}*,\n\n` +
          `We are delighted to inform you that your application for *${lead.course_name}* at *${lead.university_name}* (${lead.destination_country}) has been processed successfully!\n\n` +
          `Please contact us at your earliest convenience to review the offer conditions and start your visa & CAS/COE filing.\n\n` +
          `Congratulations from all of us at *Study World Consultant*!\n\n` +
          `*${counselorName}*`
        );

      default:
        return (
          `Hello *${lead.student_name}*,\n\n` +
          `This is *${counselorName}* from *Study World Consultant*. I am following up on your application for *${lead.course_name}* at *${lead.university_name}*.\n\n` +
          `Please let me know if you have any questions regarding your admission or visa requirements.`
        );
    }
  },
};
