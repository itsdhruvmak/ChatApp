import resend

from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


def send_otp_email(
        recipient: str,
        otp: str
) -> None:

    resend.Emails.send({
        "from": settings.RESEND_FROM_EMAIL,
        "to": [recipient],
        "subject": "Chat App email verification",
        "text": f"""
Hello,
Your chat app verification code is:

{otp}

This OTP will expire in 10 minutes.

If you did not request this code, please ignore this email.

Regards,
Chat App
"""
    })