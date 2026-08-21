package com.delvex.server.auth;

import org.springframework.context.annotation.Profile;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class MailpitPasswordResetEmailSender
        implements PasswordResetEmailSender {

    private final JavaMailSender mailSender;

    public MailpitPasswordResetEmailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void send(PasswordResetEmail email) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(email.from());
        message.setTo(email.to());
        message.setSubject(email.subject());
        message.setText(email.text());

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            throw new EmailDeliveryException(
                    "Mailpit SMTP request failed",
                    exception);
        }
    }
}
