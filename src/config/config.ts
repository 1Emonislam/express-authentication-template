export const config = {
    db_uri: process.env.DB_URI || '',
    port: parseInt(process.env.PORT || '5000'),
    api_version: process.env.API_VERSION || 'v1',
    jwt_secret: process.env.JWT_SECRET || '',
    cookie_expires: process.env.COOKIE_EXPIRES || '30d',
    cookie_short_expires: process.env.COOKIE_SHORT_EXPIRES || '1h'
}