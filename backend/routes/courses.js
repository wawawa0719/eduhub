const express = require('express');
const router = express.Router();
const db = require('../db');

// コース作成API (POST /api/courses)
router.post('/', async (req, res) => {
  // リクエストボディからコース情報とユーザーIDを取得
  const { title, description, user_id } = req.body;

  // 簡単な入力チェック
  if (!title || !user_id) {
    return res.status(400).json({ message: 'タイトルとユーザーIDは必須です。' });
  }

  try {
    // データベースに新しいコースを挿入
    const [result] = await db.execute(
      'INSERT INTO courses (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, user_id]
    );

    // 作成成功のレスポンスを返す
    res.status(201).json({ message: 'コースが正常に作成されました。', courseId: result.insertId });
  } catch (error) {
    // エラーハンドリング
    console.error('コース作成エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// コース一覧取得API (GET /api/courses)
router.get('/', async (req, res) => {
  try {
    // coursesテーブルとusersテーブルを結合して、コース情報と作成者のユーザー名を取得
    const [rows] = await db.execute(`
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.created_at, 
        u.username 
      FROM courses c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);

    // 取得したコース一覧をJSONで返す
    res.status(200).json(rows);
  } catch (error) {
    // エラーハンドリング
    console.error('コース一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

module.exports = router;
