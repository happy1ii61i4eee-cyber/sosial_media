const express = require('express');
const router = express.Router();
const { addUser } = require('../src/users.js');
const {getID}=require('../src/getId.js');
const { userPost } = require('../src/post.js');
const{searchPost} =require('../src/searchPost.js')
const{putComment}= require('../src/leaveMeg.js')

router.post('/add', addUser);
router.post('/Id',getID);
router.post('/post',userPost);
router.get('/post',searchPost);
router.put('/post',putComment);


module.exports = router;