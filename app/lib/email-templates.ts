/**
 * Standard email wrapper template that provides consistent styling
 * @param content The HTML content to wrap
 * @returns Complete HTML email with wrapper
 */
export const emailWrapper = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hockey Pouches</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #777;
      text-align: center;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #0047AB;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background-color: #f5f5f5;
    }
    .info-box {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Hockey Pouches</h1>
    </div>
    
    ${content}
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Hockey Pouches. All rights reserved.</p>
      <p>123 Business Street, Vancouver, BC V6B 1A1, Canada</p>
    </div>
  </div>
</body>
</html>
`;
