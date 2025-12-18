import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, token, diagnosisType } = req.body;

  if (!name || !phone || !token) {
    return res.status(400).json({ error: "必要な情報が不足しています" });
  }

  if (!token || token.length !== 64) {
    return res.status(401).json({ error: "認証トークンが無効です" });
  }

  try {
    const sesClient = new SESClient({
      region: process.env.AWS_REGION || "ap-northeast-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const emailBody = `
【新規申込】投資診断フォーム

━━━━━━━━━━━━━━━━━━━━━━
■ 申込情報
━━━━━━━━━━━━━━━━━━━━━━

ユーザーID: ${uid || "未設定"}
お名前: ${name}
電話番号: ${phone}
診断タイプ: 感覚派スナイパー

送信日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}

━━━━━━━━━━━━━━━━━━━━━━
※このメールは自動送信されています
※個人情報はデータベースに保存されていません
━━━━━━━━━━━━━━━━━━━━━━
    `;

    const params = {
      Source: process.env.SES_FROM_EMAIL,
      Destination: {
        ToAddresses: ["hirapro.sharea@gmail.com"],
      },
      Message: {
        Subject: {
          Data: `【新規申込】${name}様 - 投資診断結果`,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: emailBody,
            Charset: "UTF-8",
          },
        },
      },
    };

    console.log("=== メール送信情報 ===");
    console.log("送信元:", process.env.SES_FROM_EMAIL);
    console.log("送信先: hirapro.sharea@gmail.com");
    console.log("件名:", `【新規申込】${name}様 - 投資診断結果`);
    console.log("====================");

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    console.log("✅ メール送信成功! Message ID:", response.MessageId);

    return res.status(200).json({
      success: true,
      message: "メール送信成功",
    });
  } catch (error) {
    console.error("❌ メール送信エラー:", error);
    console.error("エラーコード:", error.code);
    console.error("エラーメッセージ:", error.message);

    return res.status(500).json({
      error: "メール送信に失敗しました。設定を確認してください。",
    });
  }
}
