import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    // Only create transporter if SMTP credentials are provided
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
      console.log('✅ Email service initialized');
    } else {
      console.warn('⚠️  Email service not configured. Set SMTP_* environment variables to enable emails.');
    }
  }

  private async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.ejs`);
    return ejs.renderFile(templatePath, {
      ...data,
      appName: 'Schoman',
      appUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      year: new Date().getFullYear()
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email not sent: transporter not configured');
      return false;
    }

    try {
      const html = await this.renderTemplate(options.template, options.data);

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Schoman'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  // Specific email methods
  async sendWelcomeEmail(email: string, firstName: string, role: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Bienvenue sur Schoman',
      template: 'welcome',
      data: { firstName, role }
    });
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    return this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      template: 'password-reset',
      data: { firstName, resetUrl }
    });
  }

  async sendGradeNotificationEmail(
    email: string,
    studentName: string,
    subject: string,
    grade: number,
    maxGrade: number
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Nouvelle note pour ${studentName}`,
      template: 'grade-notification',
      data: { studentName, subject, grade, maxGrade }
    });
  }

  async sendInvoiceEmail(
    email: string,
    studentName: string,
    invoiceNumber: string,
    amount: number,
    dueDate: Date
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Nouvelle facture #${invoiceNumber}`,
      template: 'invoice',
      data: { 
        studentName, 
        invoiceNumber, 
        amount: amount.toFixed(2),
        dueDate: dueDate.toLocaleDateString('fr-FR')
      }
    });
  }

  async sendPaymentConfirmationEmail(
    email: string,
    studentName: string,
    amount: number,
    invoiceNumber: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Confirmation de paiement',
      template: 'payment-confirmation',
      data: { 
        studentName, 
        amount: amount.toFixed(2),
        invoiceNumber
      }
    });
  }

  async sendAbsenceNotificationEmail(
    email: string,
    studentName: string,
    date: Date,
    reason?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Absence de ${studentName}`,
      template: 'absence-notification',
      data: { 
        studentName, 
        date: date.toLocaleDateString('fr-FR'),
        reason: reason || 'Non justifiée'
      }
    });
  }

  async sendReportCardEmail(
    email: string,
    studentName: string,
    period: string,
    pdfUrl?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Bulletin scolaire de ${studentName}`,
      template: 'report-card',
      data: { 
        studentName, 
        period,
        pdfUrl
      }
    });
  }

  async sendAnnouncementEmail(
    email: string,
    recipientName: string,
    title: string,
    message: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: title,
      template: 'announcement',
      data: { 
        recipientName, 
        title,
        message
      }
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
