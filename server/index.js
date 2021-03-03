const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')
const { auth } = require('./middleware/auth')
const { User } = require('./Models/User')



//application/x-www-form-urlencoded 이런 데이터를 분석해서 가져올 수 있게 해줌
app.use(bodyParser.urlencoded({extended: true}))

//application/json 을 분석해서 가져올 수 있게 해줌
app.use(bodyParser.json())
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('야래야래')
})


app.post('/api/users/register', (req, res) => {

   //회원가입할때 필요한 정보들을 클라이언트에서 가져오면 
   //그것들을 데이터 베이스에 넣어준다. 

   const user = new User(req.body)  //bodyParser로 req.body 를 받아올 수 있게 해준다

   user.save((err, userInfo) => { // mongoDB에 저장 하는 것  save
     if (err) return res.json({ success: false, err })
      return res.status(200).json({
        success: true
      })
   })
})


app.post('/api/users/login', (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        success: false,
        message: "제공된 이메일에 해당되는 유저가 없습니다."
      })
    }


    //요청된 이메일이 있으면 비밀먼호가 맞는지 확인
    user.comparePassword( req.body.password, (err, isMatch) => {
      if(!isMatch) 
      return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

    //비밀번호까지 같으면 token을 생성
      user.generateToken( (err, user) => {

        if(err) return res.status(400).send(err)

        // token을 저장한다 어디에 ? 쿠키 , 로컬스토리지, 세션
        res.cookie("x_auth", user.token)
        .status(200)
        .json({ success: true, userId: user._id })   
        
      })
    })
  })
})

//auth 는 미들웨어 
app.get('/api/users/auth', auth, (req, res) => {

  //여기까지 미들웨어를 통과해 왔다는 얘기는 authentication이 true 라는 말
  res.status(200).json({ 
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    mane: req.user.name, 
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
   })
})



app.get('/api/users/logout', auth, (req, res) => {

  User.findOneAndUpdate({ _id: req.user._id}, 
    { token: ""},
    (err, user) => {
      if(err) return res.json({ success: false, err })
      return res.status(200).send({ success: true })
    })

})

const port = 5000


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})