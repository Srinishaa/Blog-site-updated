//jshint esversion:6

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
const _ = require("lodash");
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://admin_nisha:Star123@cluster0.waeg9.mongodb.net/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const postSchema = new mongoose.Schema({
  name: String,
  content: String
});
let blogs;
const Post = mongoose.model("Post", postSchema);
const Blog = mongoose.model("Blog", postSchema);
// const post1 = new Post({
//   name:"homeStartingContent",
//   content: "Hello there!Welcome to your very own Blog site!!A blog (a truncation of 'weblog') is a discussion or informational website published on the World Wide Web consisting of discrete, often informal diary-style text entries (posts).Blog can also be used as a verb, meaning to maintain or add content to a blog.Record all the exciting moments of your life in a written format and share it with world."
// });
// const post2 = new Post({
//   name:"aboutContent",
//   content: "Hi! My name is Nisha and I have specially curated this blog-site for you to record all your thoughts and cherished memories and share it with the world. I strongly believe every individual's positive insights can make a huge impact in shaping the future.Blogging helps manage your online identity and build trust, improve your writting skills, connect with different people, express your knowledge and much more. Happy Blogging!"
// });
// const post3 = new Post({
//   name:"contactContent",
//   content: "I hope you are having a great experience with the Blog-site. I am junior full stack web developer and would love to make your web projects come to life. You can get in touch with me for more info :)"
// });
//
// post1.save();
// post2.save();
// post3.save();




app.get("/posts/:blog", function(req, res) {
  blogs.forEach(function(post) {
    if (_.lowerCase(post.name) == _.lowerCase(req.params.blog)) {
      res.render("post", {
        title: post.name,
        post: post.content
      });
    }
  });
});

app.get("/", function(req, res) {
  Blog.find(function(err, res) {
    if (!err) {
      blogs = res;
    }
  });
  Post.findOne({
    name: "homeStartingContent"
  }, function(err, result) {
    if (!err) {
      const homeStartingContent = result;
      res.render("home", {
        homeStartingContent: homeStartingContent.content,
        posts: blogs
      });

    }
  });




});

app.get("/about", function(req, res) {
  Post.findOne({
    name: "aboutContent"
  }, function(err, result) {
    if (!err) {
      const aboutContent = result;
      // console.log(aboutContent);
      res.render("about", {
        aboutContent: aboutContent.content
      });
    }
  });
});

app.get("/contact", function(req, res) {
  Post.findOne({
    name: "contactContent"
  }, function(err, result) {
    if (!err) {
      const contactContent = result;
      // console.log(contactContent);
      res.render("contact", {
        contactContent: contactContent.content
      });
    }
  })
});
app.post("/compose", function(req, res) {
  const blog = new Blog({
    name: req.body.title,
    content: req.body.text
  });
  blog.save();
  res.redirect("/");
})

app.get("/compose", function(req, res) {
  res.render("compose", {

  });
});






app.listen(3000, function() {
  console.log("Server started on port 3000");
});
