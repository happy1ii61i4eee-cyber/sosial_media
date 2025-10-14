const postgres = require('postgres');
const pgConfig = require('../configs/postgres');
const sql = postgres(pgConfig);

// 使用 JWT 驗證的前提下，req.user 會包含 username
async function putComment(req, res) {
  const { postID, comment } = req.body;
  const username = req.user?.username; // 從 authMiddleware 取得

  if (!username) {
    return res.status(401).json({ error: '未登入或未獲得授權' });
  }

  if (!postID || !comment || comment.length > 150) {
    return res.status(400).json({ error: '請提供貼文 ID，且留言不得為空或超過 150 字' });
  }

  try {
    // 檢查貼文是否存在
    const postCheck = await sql`
      SELECT * FROM post WHERE id = ${postID}
    `;
    if (postCheck.length === 0) {
      return res.status(404).json({ error: '找不到對應貼文 ID' });
    }

    // 插入留言
    const insertComment = await sql`
      INSERT INTO comment (post_id, username, content)
      VALUES (${postID}, ${username}, ${comment})
      RETURNING id, content, created_at
    `;

    res.status(200).json({
      message: '留言成功',
      comment: insertComment[0]
    });
  } catch (err) {
    console.error('留言失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

module.exports = { putComment };