const postgres = require('postgres');
const pgConfig = require('../configs/postgres');
const sql = postgres(pgConfig);

async function searchPost(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: '請輸入會員名稱' });
  }

  try {
    // 查詢貼文
    const posts = await sql`
      SELECT id, username, content, created_at 
      FROM post 
      WHERE username = ${username}
    `;

    if (posts.length === 0) {
      return res.status(404).json({ error: '該帳號尚無貼文' });
    }

    // 取得所有 post.id
    const postIds = posts.map(p => p.id);

    // 查詢留言（與這些貼文有關）
    const comments = await sql`
      SELECT content, post_id, username, created_at
      FROM comment 
      WHERE post_id IN ${sql(postIds)}
    `;

    res.status(200).json({
      message: '查詢成功',
      posts,
      comments
    });

  } catch (err) {
    console.error('查詢失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

module.exports = { searchPost };