const postgres = require('postgres');
const pgConfig = require('../configs/postgres');
const bcrypt = require('bcrypt');
const sql = postgres(pgConfig);

async function putComment(req, res) {
  const { username, password, postID, comment } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '未登入未獲得授權存取' });
  }

  if (!postID || !comment || comment.length > 150) {
    return res.status(400).json({ error: '請提供貼文 ID,且留言字數不得為空或超過 150 字' });
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
    const postCheck = await sql`
  SELECT * FROM post WHERE id = ${postID}
`;
if (postCheck.length === 0) {
  return res.status(404).json({ error: '找不到對應貼文 ID' });
}



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