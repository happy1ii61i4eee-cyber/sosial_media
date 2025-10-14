const postgres = require('postgres');
const pgConfig = require('../configs/postgres');
const sql = postgres(pgConfig);

async function userPost(req, res) {
  // 這裡直接從 JWT 解析結果取 user 資料
  const { username } = req.user;  
  const { content } = req.body;

  if (!content || content.length === 0 || content.length > 300) {
    return res.status(400).json({ error: '貼文內容不得為空且需小於 300 字' });
  }

  try {
    // 檢查該會員是否存在
    const result = await sql`
      SELECT * FROM member WHERE username = ${username}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: '找不到帳號' });
    }

    // 插入貼文
    const insertPost = await sql`
      INSERT INTO post (username, content)
      VALUES (${username}, ${content})
      RETURNING id, content, created_at
    `;

    res.status(200).json({
      message: '貼文成功',
      post: insertPost[0],
    });

  } catch (err) {
    console.error('貼文失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

module.exports = { userPost };
