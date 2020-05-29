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
});
// 公司架构
const CompanySchema = new Schema({
    list: {
        type: Array,
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
app.get('/xapi/getInfo', (req, res) => {
    User.find({}, (err, data) => {
        res.send(data);
    })
});


// 读取 公司数据
app.get("/xapi/getCompanyData", (req, res) => {
    // 通过数据骨架读取所有的分公司
    Company.find({}, (err, data) => {
        res.send(data);
    })
});

// 插入vedio
app.post("/xapi/createVideo", (req, res) => {
    const newVideoSchema = new Video({
        coverimg: req.body.coverimg,
        description: req.body.description,
        resourceAdd: req.body.resourceAdd,
        title: req.body.title,
        type: req.body.type,
        id: req.body.id
    });
    newVideoSchema.save().then(() => {
        res.status(200).json({
            state: "success",
            msg: "视频信息存储成功！"
        })
    });
});
//读取 vedioList
app.get("/xapi/getVideoList", (req, res) => {
    // 通过数据骨架读取视频信息
    Video.find({}, (err, data) => {
        res.send(data);
    })
});

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
            msg: "推文插入数据库成功！"
        })
    })
});
//查找新闻数据
app.get("/xapi/getNewsInfo", (req, res) => {
    News.find({}, (err, data) => {
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
//删除对应新闻数据(在url后面加参数，不可在key-value那里加参数)
app.delete("/xapi/delNewsInfo/:news_id", (req, res) => {
    News.deleteOne({ id: req.body.id }).then((data) => {
        res.status(200).json({ state: "success", msg: "成功删除对应的新闻数据！" })
    })
});

const port = 3000;
app.listen(port, () => {
    console.log(`express is running and listening for ${port}`)
})