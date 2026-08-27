import smtplib
from email.message import EmailMessage

from app.core.config import settings

def send_otp_email(
        recipient: str,
        otp:str
) -> None:

    message=EmailMessage()

    message["Subject"] = "Chat App email verification"
    message["From"] = settings.SMTP_USERNAME
    message["To"] = recipient

    message.set_content(
        f"""
Hello,
Your chat app verification code is:

{otp}

This OTP will expire in 10 minutes.

If you did not request this code, please ignore this email.

Regards,
Chat App
"""
    )

    with smtplib.SMTP(
        settings.SMTP_HOST,
        settings.SMTP_PORT
    ) as server:

        server.starttls()

        server.login(
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD
        )

        server.send_message(message)