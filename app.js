//jshint esversion:6

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
var uniqid = require('uniqid');
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const _ = require("lodash");
require("dotenv").config();
const mongoose = require('mongoose');
app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);
const postSchema = new mongoose.Schema({
  _id: String,
  name: String,
  content: String
});
const blogSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  posts: [postSchema]
});
blogSchema.plugin(passportLocalMongoose);
blogSchema.plugin(findOrCreate);
let pname;
const Post = mongoose.model("Post", postSchema);
const Blog = mongoose.model("Blog", blogSchema);
passport.use(Blog.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Blog.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/Blog-site",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    Blog.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile']
  }));
app.get('/auth/google/Blog-site',
  passport.authenticate('google', {
    failureRedirect: '/loginpage'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });
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
let blogs;
Blog.find(function(err, res) {
  if (!err) {
    blogs = res;
  }
});

app.get("/posts/:blog", function(req, res) {
  blogs.forEach(function(post) {
    // console.log(post.id)
    post.posts.forEach((item) => {
      if (item.id == req.params.blog) {
        res.render("post", {
          title: item.name,
          post: item.content
        });
      }
    });
  })
});
app.get("/post/:blog", function(req, res) {
  blogs.forEach(function(post) {
    // console.log(post.id)
    post.posts.forEach((item) => {
      if (item.id == req.params.blog) {
        res.render("private/post", {
          title: item.name,
          post: item.content
        });
      }
    });
  })
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
      })
    }
  });
});
app.get("/loginpage", function(req, res) {
  res.render("loginpage")
})
app.post("/register", function(req, res) {
  Blog.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/loginpage");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/home");
      })
    }
  })
})

app.post("/login", function(req, res) {
  const user = new Blog({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err)
      console.log(err);
    else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/home");
      })
    }
  })
})

app.get("/home", function(req, res) {
  if (req.isAuthenticated()) {
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
        res.render("private/home", {
          homeStartingContent: homeStartingContent.content,
          posts: blogs
        })
      }
    });
  } else {
    res.redirect("/loginpage")
  }
})
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})

app.get("/mypost", function(req, res) {
  // console.log(req.user.id);
  Blog.findOne({
    _id: req.user.id
  }, function(err, result) {
    // console.log(result);
    res.render("private/mypost", {
      user: result
    })
  })
})
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
  Blog.update({
    _id: req.user.id
  }, {
    $push: {
      posts: {
        _id: uniqid(),
        name: req.body.title,
        content: req.body.text
      }
    }
  }, function(err) {
    if (!err) {
      res.redirect("/home");
    }
  })
});
app.post("/edit/:blog", function(req, res) {
  console.log(req.params.blog);
  Blog.updateOne({
    _id: req.user.id
  }, {
    $pull: {
      posts: {
        _id: req.params.blog
      }
    }
  }, function() {})
  Blog.updateOne({
    _id: req.user.id
  }, {
    $push: {
      posts: {
        _id: uniqid(),
        name: req.body.title,
        content: req.body.content
      }
    }
  }, function(err) {
    if (!err) {
      res.redirect("/home");
    }
  });
})
app.get("/delete/:blog", function(req, res) {
  Blog.update({
    _id: req.user.id
  }, {
    $pull: {
      posts: {
        _id: req.params.blog
      }
    }
  }, function(err) {
    if (!err) {
      res.redirect("/home");
    }
  })
});
app.get("/compose", function(req, res) {
  res.render("private/compose", {});
});
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
// https://sheltered-atoll-85459.herokuapp.com/
// mongodb+srv://admin_nisha:"+password+"@cluster0.waeg9.mongodb.net/blogDB
