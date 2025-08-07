const postgres = require('postgres');
const pgConfig = require('../configs/postgres');
const sql = postgres(pgConfig);
const bcrypt = require('bcrypt'); 

async function userPost(req, res) {
  const { username, password, content } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '未登入未獲得授權存取' });
  }

  if (!content || content.length === 0 || content.length > 300) {
    return res.status(400).json({ error: '貼文內容不得為空且需小於 300 字' });
  }

  try {
    
    const result = await sql`
      SELECT * FROM member WHERE username = ${username}
    `;

    if (result.length === 0) {
      return res.status(401).json({ error: '帳號不存在' });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '密碼錯誤' });
    }

    // 插入貼文
    const insertPost = await sql`
      INSERT INTO post (username, content)
      VALUES (${username}, ${content})
      RETURNING id, created_at
    `;

    const post = insertPost[0];

    res.status(200).json({
      message: '貼文成功',
      post: {
        id: post.id,
        created_at: post.created_at,
      },
    });
  } catch (err) {
    console.error('貼文失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

module.exports = { userPost };