import dotenv from 'dotenv';

dotenv.config();

const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: 'localhost',
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};

export default sqlConfig;