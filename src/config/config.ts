export const config = {
    db_uri: process.env.DB_URI || '',
    port: parseInt(process.env.PORT || '5000'),
    api_version: process.env.API_VERSION || 'v1',
    cors_support: process.env.CORS_SUPPORT || "*",
    jwt_secret: process.env.JWT_SECRET || '',
    cookie_expires: process.env.COOKIE_EXPIRES || '30d',
    cookie_short_expires: process.env.COOKIE_SHORT_EXPIRES || '1h',
    client_url: process.env.CLIENT_URL || '',
    logo: process.env.LOGO,
    domain: process.env.DOMAIN,
    gmail_host: process.env.GMAIL_HOST,
    admin_sender_email: process.env.ADMIN_SENDER_EMAIL,
    gmail_password: process.env.GMAIL_PASSWORD,


}