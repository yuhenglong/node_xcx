const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const nodemailer = require("nodemailer");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const Schema = mongoose.Schema;
// client information
const UserSchema = new Schema({
        username: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        adress: {
            type: String,
            required: false
        },
        message: {
            type: String,
            required: false
        },
        date: {
            type: Date,
            default: Date.now
        }
    })
    // 公司架构
const CompanySchema = new Schema({
        list: {
            type: Array,
            required: true
        }
    })
    // 邮件传输
const transporter = nodemailer.createTransport({
    host: "smtp.qq.com", //qq smtp服务器地址
    secureConnection: false, //是否使用安全连接，对https协议的
    port: 465, //qq邮件服务所占用的端口
    auth: {
        user: "907161303@qq.com", //开启SMTP的邮箱，有用发送邮件
        pass: "hdbegcmbnbnjbfde" //授权码
    }
})

const mailOption = {
    from: "907161303@qq.com",
    to: "15916310431@163.com", //收件人
    cc: "taoshaoping@yungumedia.com", //抄送
    subject: "微信小程序获取的客户信息", //纯文本
    text: ''
}

const User = mongoose.model("users", UserSchema);
const Company = mongoose.model("companys", CompanySchema);
// connnect mongodb
mongoose
    .connect(
        'mongodb://localhost:27017/xcx', { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

app.post("/xapi/sendEmail", (req, res) => {
    const newUserSchema = new User({
            username: req.body.username,
            phone: req.body.phone,
            adress: req.body.adress,
            message: req.body.message
        })
        // send context
    const username = req.body.username;
    const phone = req.body.phone;
    const adress = req.body.adress;
    const message = req.body.message;

    const text = `
          客户姓名：${username}
          客户电话：${phone}
          客户地址：${adress}
          留言：${message}`;
    mailOption.text = text;

    newUserSchema.save().then(() => {
        // sendEmail
        transporter.sendMail(mailOption, () => {
            res.status(200).json({
                state: 'success',
                msg: "邮件发送成功！"
            })
        })
    }).catch(err => console.log(err));
})

// create company classification 
app.post("/xapi/createCompany", (req, res) => {
    const newCompanySchema = new Company({
        company: req.body.company
    });
    newCompanySchema.save().then(() => {
        res.status(200).json({
            state: "success",
            msg: "分公司架构存储成功！"
        })
    })
})

// 读取 data
app.get("/xapi/getCompanyData", (req, res) => {
    // 通过数据模型读取所有的分公司
    Company.find({}, (err, data) => {
        res.send(data);
    })
})

const port = 3000;
app.listen(port, () => {
    console.log(`express is running and listening for ${port}`)
})