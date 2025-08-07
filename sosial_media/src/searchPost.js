const postgres = require('postgres');
const pgConfig = require('../configs/postgres');
const sql = postgres(pgConfig);

async function searchPost(req, res) {
  const {username} = req.query;

  if (!username) {
    return res.status(400).json({ error: '請輸入會員名稱' });
  }

 try {
   const posts = await sql`
  SELECT username, content, id,created_at FROM post WHERE username = ${username}
`;
 if (posts.length === 0) {
      return res.status(404).json({ error: '該帳號尚無貼文' });
    }
// 查詢 comment
const comments = await sql`
  SELECT content FROM comment WHERE username = ${username}
`;

    res.status(200).json({
      message: '貼文如下：',
      posts: posts ,// 直接回傳貼文清單
      comment:comments
      
    });
  } catch (err) {
    console.error('查詢失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

module.exports = { searchPost };
    