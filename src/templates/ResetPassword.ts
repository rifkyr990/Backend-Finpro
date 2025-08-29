export const requestResetPasswordEmail = (resetUrl: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset Password</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 6px; box-shadow: 0 0 8px rgba(0,0,0,0.1);}
        h2 { color: #333; }
        p { color: #555; font-size: 16px; }
        .btn {
        display: inline-block;
        padding: 12px 24px;
        background-color: #dc3545;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
        margin-top: 20px;
        }
        .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #888;
        text-align: center;
        }
    </style>
    </head>
    <body>
    <div class="container">
        <h2>Reset Password</h2>
        <p>Hai,</p>
        <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk mengatur password baru:</p>
        <a href="${resetUrl}" class="btn">Reset Password</a>
        <p>Jika tombol di atas tidak bekerja, salin dan tempel tautan ini ke browser Anda:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Jika Anda tidak melakukan permintaan ini, abaikan email ini.</p>
        <div class="footer">
        &copy; 2025 Your Company. All rights reserved.
        </div>
    </div>
    </body>
    </html>
    `
}
