# EduNexa
 - ## It is a modern School Learning Management System (LMS) designed to provide a centralized platform for students, teachers, parents, and school administrators.

## Email verification

Password-based accounts must verify their email address before they can sign in. Configure an SMTP sender in `edunexa/.env` using the keys in `edunexa/.env.example`. For Gmail, use a Google App Password rather than your normal account password. Never commit `.env` or share its values.

After adding the SMTP settings, apply the database migration and regenerate Prisma from the `edunexa` directory:

```sh
npx prisma migrate deploy
npx prisma generate
```

Verification links expire after 24 hours. Users can request a replacement from `/verify-email`.
