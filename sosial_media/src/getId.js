const postgres = require('postgres');
const pgConfig = require('../configs/postgres');
const sql = postgres(pgConfig);
const bcrypt = require('bcrypt');

async function getID(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '請輸入帳號密碼' });
  }

  try {
    // 查詢使用者資料
    const result = await sql`
      SELECT * FROM member WHERE username = ${username}
    `;

    if (result.length === 0) {
      return res.status(401).json({ error: '帳號不存在' });
    }

    const user = result[0];

    // 使用 bcrypt 比對密碼
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: '密碼錯誤' });
    }

    res.status(200).json({
      message: '登入成功',
      user: {
        id: user.id,
      },
    });
  } catch (err) {
    console.error('查詢失敗:', err.message);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

module.exports = { getID };