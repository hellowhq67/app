import { NextRequest } from "next/server"
import { Resend } from "resend"
import { apiSuccess, apiError, handleApiError } from "@/lib/api"
import { z } from 'zod/v3';

const resend = new Resend(process.env.RESEND_API_KEY)

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  category: z.string().min(1),
  message: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = ContactSchema.safeParse(json)

    if (!parsed.success) {
      return apiError(400, 'All fields are required', 'BAD_REQUEST')
    }

    const { name, email, subject, category, message } = parsed.data

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: "Pedagogist's PTE <noreply@pedagogistpte.com>",
      to: ["support@pedagogistpte.com"], // Replace with your support email
      replyTo: email,
      subject: `[${category.toUpperCase()}] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
        <hr />
        <p><small>Sent via Pedagogist's PTE Contact Form</small></p>
      `,
    })

    // Send confirmation email to user
    await resend.emails.send({
      from: "Pedagogist's PTE <noreply@pedagogistpte.com>",
      to: [email],
      subject: "We received your message",
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hi ${name},</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p><strong>Your message:</strong></p>
        <p><em>${subject}</em></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
        <hr />
        <p>Best regards,<br />Pedagogist's PTE Support Team</p>
        <p><small>If you didn't send this, please ignore this email.</small></p>
      `,
    })

    return apiSuccess({ success: true, id: emailResult.data?.id })
  } catch (e) {
    return handleApiError(e, 'POST /api/contact')
  }
}
