"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationEmailTemplate = void 0;
const notificationEmailTemplate = ({ title, message, buttonText, buttonUrl, }) => {
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <style>
        body {
          font-family: "Segoe UI", Arial, sans-serif;
          background-color: #f4f7fb;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }
        .header {
          background: #1c9e0b;
          color: #fff;
          text-align: center;
          padding: 30px 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        .content {
          padding: 30px 25px;
          line-height: 1.6;
        }
        .content h2 {
          color: #222;
          font-size: 20px;
          margin-bottom: 12px;
        }
        .content p {
          font-size: 15px;
          color: #555;
          margin: 8px 0;
        }
        .btn {
          display: inline-block;
          padding: 14px 28px;
          margin: 20px 0;
          background: #1c9e0b;
          color: #fff !important;
          text-decoration: none;
          font-weight: 600;
          border-radius: 6px;
          transition: opacity 0.3s ease;
        }
        .btn:hover {
          opacity: 0.9;
        }
        .link {
          word-break: break-all;
          color: #007bff;
          text-decoration: none;
        }
        .footer {
          background: #f9fafc;
          text-align: center;
          font-size: 12px;
          color: #888;
          padding: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FreshCart</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          <p>Halo,</p>
          <p>${message}</p>
          <p style="text-align:center;">
            <a href="${buttonUrl}" class="btn">${buttonText}</a>
          </p>
          <p>Jika tombol di atas tidak berfungsi, salin tautan berikut ke browser Anda:</p>
          <p><a href="${buttonUrl}" class="link">${buttonUrl}</a></p>
          <p>Jika Anda tidak merasa melakukan tindakan ini, Anda bisa mengabaikan email ini.</p>
        </div>
        <div class="footer">
          &copy; 2025 FreshCart. Semua hak dilindungi.
        </div>
      </div>
    </body>
    </html>
    `;
};
exports.notificationEmailTemplate = notificationEmailTemplate;
//# sourceMappingURL=NotificationEmailTemplate.js.map