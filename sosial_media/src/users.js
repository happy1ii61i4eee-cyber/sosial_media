const postgres = require('postgres');
const pgConfig = require('../configs/postgres');
let sql;
if (!process.env.TEST_MODE) {
  sql = postgres(pgConfig);  
} else {
  sql = postgres(require('../configs/postgres-test.json'));
}

const bcrypt = require('bcrypt');

async function addUser(req, res) {
  const { username, email, password, city } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: '缺少 username、email 或 password 資料' });
  }if (password.length < 6 || password.length > 12) {
  return res.status(400).json({ error: '密碼長度需介於6至12字元' });
}


  try {
    // 檢查 email 是否已存在
    const result = await sql`
      SELECT id, username, email FROM member WHERE email = ${email}
    `;

    if (result.length > 0) {
      console.log("email!!!", result[0].username, "  ", result[0].id);
      return res.status(409).json({ error: 'Email已被使用' });
    }

    const result2=await sql`
      SELECT username FROM member WHERE username = ${username}
    `;
     if (result2.length > 0) {
       console.log("username!!!");
      return res.status(409).json({ error: 'username已被使用' });
    }

    // 密碼加密，saltRounds 設為 10（合理數值）
    const hashedPassword = await bcrypt.hash(password, 10);

    // 寫入資料庫並回傳 id
    const insertResult = await sql`
      INSERT INTO member (username, email, password, city)
      VALUES (${username}, ${email}, ${hashedPassword}, ${city || null})
      RETURNING id
    `;

    res.status(201).json({
      message: '註冊成功，請重新登入取得 USER ID。'
    });
  } catch (err) {
    console.error('新增失敗:', err.message);
    res.status(500).json({ error: '資料庫錯誤' });
  }
}

module.exports = { addUser };