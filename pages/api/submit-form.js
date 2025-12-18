import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// プロラインへサーバーサイドで送信する関数
async function submitToProline(uid, name, phone) {
  try {
    const formData = new URLSearchParams();
    formData.append("uid", uid || "");
    formData.append("txt[m3ivdLm0TQ]", name);
    formData.append("txt[c7OXGIYUTL]", phone);

    console.log("=== プロライン送信情報 ===");
    console.log("UID:", uid || "未設定");
    console.log("名前:", name);
    console.log("電話番号:", phone);
    console.log("送信先URL:https://z8nhy9aq.autosns.app/fm/qCfHZiTbc0");
    console.log("========================");

    const response = await fetch("https://z8nhy9aq.autosns.app/fm/qCfHZiTbc0", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    console.log("プロライン送信レスポンスステータス:", response.status);
    
    // レスポンスの内容をログに出力（デバッグ用）
    const responseText = await response.text();
    console.log("プロラインレスポンス内容:", responseText.substring(0, 500));

    if (response.ok || response.status === 302 || response.status === 301) {
      console.log("✅ プロライン送信成功!");
      return { success: true };
    } else {
      console.log("⚠️ プロライン送信: ステータス", response.status);
      // ステータスが200以外でもエラーとしない（リダイレクトなどの場合があるため）
      return { success: true };
    }
  } catch (error) {
    console.error("❌ プロライン送信エラー:", error.message);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, token, diagnosisType, uid } = req.body;

  if (!name || !phone || !token) {
    return res.status(400).json({ error: "必要な情報が不足しています" });
  }

  if (!token || token.length !== 64) {
    return res.status(401).json({ error: "認証トークンが無効です" });
  }

  try {
    // 1. プロラインへ送信（サーバーサイドで実行）
    console.log("📤 プロラインへ送信開始...");
    const prolineResult = await submitToProline(uid, name, phone);
    
    if (!prolineResult.success) {
      console.error("プロライン送信失敗:", prolineResult.error);
      // プロライン送信が失敗してもメール送信は続行
    }

    // 2. メール送信
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

━━━━━━━━━━━━━━━━━━━━━━
※このメールは自動送信されています
※個人情報はデータベースに保存されていません
━━━━━━━━━━━━━━━━━━━━━━
    `;

    const toEmail = process.env.SES_TO_EMAIL || "hirapro.sharea@gmail.com";
    
    const params = {
      Source: process.env.SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [toEmail],
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
    console.log("送信先:", toEmail);
    console.log("件名:", `【新規申込】${name}様 - 投資診断結果`);
    console.log("====================");

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    console.log("✅ メール送信成功! Message ID:", response.MessageId);

    return res.status(200).json({
      success: true,
      message: "送信完了",
      prolineSuccess: prolineResult.success,
    });
  } catch (error) {
    console.error("❌ エラー:", error);
    console.error("エラーコード:", error.code);
    console.error("エラーメッセージ:", error.message);

    return res.status(500).json({
      error: "送信に失敗しました。設定を確認してください。",
    });
  }
}
