const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

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
});
// 公司架构
const CompanySchema = new Schema({
    list: {
        type: [String],
        required: true
    }
});
//视频骨架
const VideoSchema = new Schema({
    coverimg: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    resourceAdd: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});
//新闻数据骨架
const NewsSchema = new Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    context: { type: String, required: true },
    date: { type: String, required: true },
    year: { type: String, required: true },
    newsInfo: {
        type: [String],
        required: true
    }
});
// 邮件传输
const transporter = nodemailer.createTransport({
    host: "smtp.qq.com", //qq smtp服务器地址
    secureConnection: false, //是否使用安全连接，对https协议的
    port: 465, //qq邮件服务所占用的端口
    auth: {
        user: "907161303@qq.com", //开启SMTP的邮箱，有用发送邮件
        pass: "hdbegcmbnbnjbfde" //授权码
    }
});

const mailOption = {
    from: "907161303@qq.com",
    to: "15916310431@163.com", //收件人
    cc: "taoshaoping@yungumedia.com", //抄送
    subject: "微信小程序获取的客户信息", //纯文本
    text: ''
};

const User = mongoose.model("users", UserSchema);
const Company = mongoose.model("companys", CompanySchema);
const Video = mongoose.model("video", VideoSchema);
const News = mongoose.model("news", NewsSchema);
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
});
//读取用户信息
app.get('/xapi/getInfo', (req, res) => {
    User.find({}, (err, data) => {
        res.send(data);
    })
});
// 创建公司数据
app.post("/xapi/createCompanyData", (req, res) => {
    // 字符串转换成数组
    let newCompany = req.body.list.split(",");
    const newCompanySchema = new Company({
        list: newCompany
    });
    newCompanySchema.save().then((err, data) => {
        res.status(200).json({
            state: "success",
            msg: "公司架构数据插入成功！"
        })
    })
});
// 读取 公司数据
app.get("/xapi/getCompanyData", (req, res) => {
    // 通过数据骨架读取所有的分公司
    Company.find({}, (err, data) => {
        res.send(data);
    })
});

// // 插入vedio
// app.post("/xapi/createVideo", (req, res) => {
//     const newVideoSchema = new Video({
//         coverimg: req.body.coverimg,
//         description: req.body.description,
//         resourceAdd: req.body.resourceAdd,
//         title: req.body.title,
//         type: req.body.type,
//         id: req.body.id
//     });
//     newVideoSchema.save().then(() => {
//         res.status(200).json({
//             state: "success",
//             msg: "视频信息存储成功！"
//         })
//     });
// });
// //读取 vedioList
// app.get("/xapi/getVideoList", (req, res) => {
//     // 通过数据骨架读取视频信息
//     Video.find({}, (err, data) => {
//         res.send(data);
//     })
// });

//增加新闻数据
app.post("/xapi/createNews", (req, res) => {
    // 字符串转换成数组
    let newsInfoArr = req.body.newsInfo.split(",");
    const newsInfoSchema = new News({
        image: req.body.image,
        title: req.body.title,
        context: req.body.context,
        date: req.body.date,
        year: req.body.year,
        newsInfo: newsInfoArr
    });
    newsInfoSchema.save().then((err, data) => {
        res.status(200).json({
            state: "success",
            msg: "增加新闻数据成功！"
        })
    })
});
//查找所有新闻数据
app.get("/xapi/getNewsInfo", (req, res) => {
    News.find({}, (err, data) => {
        res.send(data);
    });
});
//查找一条新闻数据
app.post("/xapi/getOneNewInfo", (req, res) => {
    News.findOne({ _id: req.body._id }, (err, data) => {
        res.send(data);
    });
});
//更新新闻数据
app.post("/xapi/upDateNewsInfo", (req, res) => {
    // 字符串转换成数组
    let newsInfoArr = req.body.newsInfo.split(",");
    const updateNew = {
        image: req.body.image,
        title: req.body.title,
        context: req.body.context,
        date: req.body.date,
        year: req.body.year,
        newsInfo: newsInfoArr
    };
    // 根据数据库ID更新新闻数据
    News.updateOne({ _id: req.body.id }, { $set: updateNew }, (err, data) => { res.json(data) });
});
//删除对应新闻数据(在postman 的body里面设置key-value)
app.post("/xapi/delNewsInfo", (req, res) => {
    News.deleteOne({ _id: req.body.id }).then((data) => {
        res.status(200).json({ state: "success", msg: "成功删除对应的新闻数据！" })
    });
});

//读取data.json文件并返回json数据
app.get("/xapi/getPlaceInfo",(req,res)=>{
    const file = path.join(__dirname,"/data.json");
    fs.readFile(file,"utf-8",(err,data) =>{
        if(err){
            res.send("文件读取失败");
        }else{
            res.send(data)
        }
    })
})

// 读取video.json文件并返回json数据
app.post("/xapi/getVideo",(req,res)=>{
    const file = path.join(__dirname,"/video.json");
    fs.readFile(file,"utf-8",(err,data) =>{
        if(err){
            res.send("文件读取失败");
        }else{
            res.send(data)
        }
    })
})
// 读取newsData.json文件并返回json数据
app.get("/xapi/getnewsData",(req,res)=>{
    const file = path.join(__dirname,"/newsData.json");
    fs.readFile(file,"utf-8",(err,data) =>{
        if(err){
            res.send("文件读取失败");
        }else{
            res.send(data)
        }
    })
})

const port = 3000;
app.listen(port, () => {
    console.log(`express is running and listening for ${port}`)
})