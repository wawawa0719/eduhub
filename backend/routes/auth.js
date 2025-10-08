const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const jwt = require('jsonwebtoken');

// ユーザー登録のエンドポイント
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: '全てのフィールドを入力してください。' });
  }

  try {
    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーをデータベースに挿入
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'ユーザーが正常に登録されました。', userId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'ユーザー名またはメールアドレスは既に使用されています。' });
    }
    console.error('登録エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// ユーザーログインのエンドポイント
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'メールアドレスとパスワードを入力してください。' });
  }

  try {
    // メールアドレスでユーザーを検索
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: '認証に失敗しました。' });
    }

    const user = rows[0];

    // パスワードの比較
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // パスワードが一致
      // JWTを生成
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // トークンの有効期限
      );

      res.status(200).json({ message: 'ログインに成功しました。', token: token });
    } else {
      // パスワードが不一致
      res.status(401).json({ message: '認証に失敗しました。' });
    }
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

module.exports = router;
