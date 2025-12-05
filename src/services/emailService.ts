import { Resend } from "resend";

// Lazy-load Resend client to avoid build-time errors
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM_NAME = process.env.RESEND_FROM_NAME || "Kanyiji Marketplace";

export interface SendVerificationEmailParams {
  email: string;
  token: string;
  fullName?: string;
}

export interface SendPasswordResetEmailParams {
  email: string;
  token: string;
  fullName?: string;
}

export interface SendVendorConfirmationEmailParams {
  email: string;
  businessName: string;
  fullName?: string;
}

/**
 * Send email verification OTP
 */
export async function sendVerificationEmail({
  email,
  token,
  fullName,
}: SendVerificationEmailParams) {
  try {
    const resend = getResend();
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
    
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: "Verify your Kanyiji account",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Kanyiji Marketplace</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
              ${fullName ? `<p>Hello ${fullName},</p>` : '<p>Hello,</p>'}
              <p>Thank you for signing up for Kanyiji Marketplace! To complete your registration, please verify your email address using the code below:</p>
              
              <div style="background: #f3f4f6; border: 2px dashed #D4AF37; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E3A8A; font-family: monospace;">
                  ${token}
                </div>
                <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">This code expires in 10 minutes</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">Or click the button below to verify:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email</a>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                If you didn't create an account with Kanyiji, you can safely ignore this email.
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} Kanyiji Marketplace. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `
        Verify Your Email Address
        
        ${fullName ? `Hello ${fullName},` : 'Hello,'}
        
        Thank you for signing up for Kanyiji Marketplace! To complete your registration, please verify your email address using the code below:
        
        Verification Code: ${token}
        
        This code expires in 10 minutes.
        
        If you didn't create an account with Kanyiji, you can safely ignore this email.
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Send verification email error:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  email,
  token,
  fullName,
}: SendPasswordResetEmailParams) {
  try {
    const resend = getResend();
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
    
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: "Reset your Kanyiji password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Kanyiji Marketplace</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
              ${fullName ? `<p>Hello ${fullName},</p>` : '<p>Hello,</p>'}
              <p>We received a request to reset your password for your Kanyiji account. Use the code below to reset your password:</p>
              
              <div style="background: #f3f4f6; border: 2px dashed #D4AF37; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E3A8A; font-family: monospace;">
                  ${token}
                </div>
                <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">This code expires in 1 hour</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">Or click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} Kanyiji Marketplace. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `
        Reset Your Password
        
        ${fullName ? `Hello ${fullName},` : 'Hello,'}
        
        We received a request to reset your password for your Kanyiji account. Use the code below to reset your password:
        
        Reset Code: ${token}
        
        This code expires in 1 hour.
        
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Send password reset email error:", error);
    throw error;
  }
}

/**
 * Send vendor onboarding confirmation email
 */
export async function sendVendorConfirmationEmail({
  email,
  businessName,
  fullName,
}: SendVendorConfirmationEmailParams) {
  try {
    const resend = getResend();
    
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: "Vendor Application Received - Kanyiji Marketplace",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vendor Application Received</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Kanyiji Marketplace</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Vendor Application Received</h2>
              ${fullName ? `<p>Hello ${fullName},</p>` : '<p>Hello,</p>'}
              <p>Thank you for submitting your vendor application for <strong>${businessName}</strong> on Kanyiji Marketplace!</p>
              
              <div style="background: #f0f9ff; border-left: 4px solid #D4AF37; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="color: #1E3A8A; margin-top: 0;">What Happens Next?</h3>
                <ul style="color: #4b5563; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">Our team will review your application and documents</li>
                  <li style="margin-bottom: 10px;">We'll verify your business information and KYC documents</li>
                  <li style="margin-bottom: 10px;">You'll receive an email within 2-3 business days with our decision</li>
                  <li style="margin-bottom: 10px;">Once approved, you can start listing your products on our marketplace</li>
                </ul>
              </div>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  <strong>Application Details:</strong><br>
                  Business Name: ${businessName}<br>
                  Application Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                If you have any questions about your application, please don't hesitate to contact our support team.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kanyiji.ng'}" style="background: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Visit Kanyiji Marketplace</a>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                We're excited to have you join our community of African entrepreneurs!
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} Kanyiji Marketplace. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `
        Vendor Application Received
        
        ${fullName ? `Hello ${fullName},` : 'Hello,'}
        
        Thank you for submitting your vendor application for ${businessName} on Kanyiji Marketplace!
        
        What Happens Next?
        - Our team will review your application and documents
        - We'll verify your business information and KYC documents
        - You'll receive an email within 2-3 business days with our decision
        - Once approved, you can start listing your products on our marketplace
        
        Application Details:
        Business Name: ${businessName}
        Application Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        
        If you have any questions about your application, please don't hesitate to contact our support team.
        
        We're excited to have you join our community of African entrepreneurs!
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Send vendor confirmation email error:", error);
    throw error;
  }
}

