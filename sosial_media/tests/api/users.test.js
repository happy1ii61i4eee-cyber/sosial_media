const request = require('supertest');
const server = require('../../bin/www');
const agent = request(server);

const postgres = require('postgres');
const pgConfig = require('../../configs/postgres-test.json');
const sql = postgres(pgConfig);

describe('(testdb)Test API: /users', function() {
  // 測試新增會員
  describe('POST /members/add', function() {
    const path = '/members/add';
    const member = {
     username: 'gogo985',  
    email: 'gogo985@gmail.com',
    password: 'gogo123'
    };

    it('[新增成功] 合法使用者, 須回傳201', function(done) {
      agent
        .post(path)
        .send(member)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          console.log('print result:', JSON.parse(res.text));
          done();
        });
    });
  });

  // 測試登入
  describe('POST /members/Id', function() {
    const path = '/members/Id';
    const member = {
      username: 'gogo985',
      password: 'gogo123'
    };

    it('[登入成功] 合法使用者, 須回傳 ID', function(done) {
      agent
        .post(path)
        .send(member)
        .expect(200)  
        .expect(res => {
          if (!res.body.user||!res.body.user.id){ throw new Error("缺少回傳 id");}
        })
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

   describe('POST /members/post', function() {
    const path = '/members/post';
    const member = {
      username: 'gogo985',
      password: 'gogo123',
      content:'第一次貼文,1'
    };

    it('[貼文成功] 合法使用者, 須回傳ID/time', function(done) {
      agent
        .post(path)
        .send(member)
        .expect(200)  
        .expect(res => {
          if (!res.body.post.id||!res.body.post.created_at){ throw new Error("缺少回傳資料");}
        })
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

describe('GET /members/post', function() {
  const path = '/members/post';
  const username = 'gogo985';

  it('[查詢成功] 合法使用者, 須回傳貼文資料', function(done) {
    agent
      .get(path)
      .query({ username }) // 傳入 username=gogo985
      .expect(200)
      .expect(res => {
        const posts = res.body.posts;
        if (!posts || posts.length === 0) {
          throw new Error("缺少回傳資料");
        }
      }) // 👈 這裡括號要正確關閉
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});

describe('PUT /members/post', function() {
  const path = '/members/post';
  const member = {
    username: 'gogo985',
    password: 'gogo123',
    postID: 21, // 這個 ID 必須是已存在的貼文
    comment: '這是測試留言'
  };

  it('[留言成功] 合法使用者, 須回傳留言 ID 與時間戳', function(done) {
    agent
      .put(path)
      .send(member)
      .expect(200)
      .expect(res => {
        if (!res.body.message || res.body.message !== '留言成功') {
          throw new Error("留言訊息錯誤或缺失");
        }
        const c = res.body.comment;
        if (!c || !c.id || !c.content || !c.created_at) {
          throw new Error("回傳留言資料缺失");
        }
      })
      .end(function(err) {
        if (err) return done(err);
        done();
      });
  });
});
  

  // 清除測試資料
  after(async function() {
    await sql`
     DELETE FROM member `;
    
  });
});