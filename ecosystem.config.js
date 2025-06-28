module.exports = {
    apps: [
        {
            name: "ozpay", // nama aplikasi di PM2
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 4000, // <- bisa kamu ganti sesuai kebutuhan
            },
        },
    ],
};
