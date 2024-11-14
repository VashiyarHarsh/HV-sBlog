require('dotenv').config();

const express = require('express');
const PORT = process.env.PORT;
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const mailRoute = require('./routes/mail');
const Blog = require('./models/blog');

mongoose.connect(process.env.MONGO_URL)
.then((e) => console.log('MongoDB chalu hai'));

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')));
app.use('/user', userRoute);
app.use('/blog', blogRoute);
app.use('/mail', mailRoute);
app.use((req, res, next) => {
    res.locals.user = req.user; 
    next();
});

app.get('/', async (req, res) => {
    const allBlogs = await Blog.find({}).sort({createdAt: -1});
    res.render('home', { 
        user: req.user,
        blogs: allBlogs, 
    }); 
});

app.listen(PORT, () => console.log(`Server port ${PORT} pe chalu hai`));