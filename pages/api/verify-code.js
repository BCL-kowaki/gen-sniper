const twilio = require("twilio");
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, code } = req.body;

  if (!phone || !code) {
    return res
      .status(400)
      .json({ error: "電話番号と認証コードを入力してください" });
  }

  // 電話番号を正規化
  let cleanPhone = phone.replace(/[-\s+]/g, "");

  let internationalPhone;
  if (cleanPhone.startsWith("81")) {
    internationalPhone = `+${cleanPhone}`;
  } else if (cleanPhone.startsWith("0")) {
    internationalPhone = `+81${cleanPhone.substring(1)}`;
  } else {
    return res.status(400).json({ error: "電話番号の形式が正しくありません" });
  }

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: internationalPhone,
        code: code,
      });

    if (verification.status === "approved") {
      const token = crypto.randomBytes(32).toString("hex");

      return res.status(200).json({
        success: true,
        token,
        message: "認証成功",
      });
    } else {
      return res.status(400).json({
        error: "認証コードが正しくありません。",
      });
    }
  } catch (error) {
    console.error("認証エラー:", error);

    if (error.code === 20404) {
      return res.status(400).json({
        error: "認証コードの有効期限が切れているか、正しくありません。",
      });
    }

    return res.status(500).json({
      error: "認証処理に失敗しました。",
    });
  }
}
