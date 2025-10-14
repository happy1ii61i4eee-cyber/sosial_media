// src/profile.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth.js'); // ✅ 有登入驗證的話請加這行
const postgres = require('postgres');
const pgConfig = require('../configs/postgres');
const sql = postgres(pgConfig);

router.get('/', authMiddleware, async (req, res) => {
  try {
    // 從 token 拿出登入使用者 ID
    const userId = req.user.id;

    // 查詢會員資料
    const memberResult = await sql`
      SELECT id, username, email, city 
      FROM member 
      WHERE id = ${userId}
    `;
    if (memberResult.length === 0) {
      return res.status(404).json({ error: '找不到會員資料' });
    }

    const user = memberResult[0];

    // 查詢該會員的貼文
    const posts = await sql`
      SELECT id, content, created_at
      FROM post
      WHERE username = ${user.username}
      ORDER BY created_at DESC
    `;

    // 查詢留言（如果有貼文的話）
    let comments = [];
    if (posts.length > 0) {
      const postIds = posts.map(p => p.id);
      comments = await sql`
        SELECT id, post_id, username, content, created_at
        FROM comment
        WHERE post_id IN ${sql(postIds)}
        ORDER BY created_at ASC
      `;
    }

    res.json({
      message: '會員資料載入成功',
      user,
      posts,
      comments
    });

  } catch (err) {
    console.error('取得會員資料失敗:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;

