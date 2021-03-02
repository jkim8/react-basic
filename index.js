const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const config = require('./config/key')
const { User } = require('./Models/User')


//application/x-www-form-urlencoded 이런 데이터를 분석해서 가져올 수 있게 해줌
app.use(bodyParser.urlencoded({extended: true}))

//application/json 을 분석해서 가져올 수 있게 해줌
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('워이워이')
})


app.post('/register', (req, res) => {

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



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})