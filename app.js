//jshint esversion:6
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

const port= process.env.PORT||3000;
const username = encodeURIComponent("koushal");
const password = encodeURIComponent("Admin@123");
const homeStartingContent = "Welcome to the blogs Website , You can Add, Edit and Delete blogs of your wish";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "You can contact me at <i style='color:blue;'>koushaljha889@gmail.com</i> , i will be happy to help you";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const uri = `mongodb+srv://${username}:${password}@cluster0.umyncf0.mongodb.net/blogDB?retryWrites=true&w=majority`;
mongoose.connect(uri, { //here we are connection to above uri
  useNewUrlParser: true,
});
//here we just get confirmation of connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
const blogSchema = new mongoose.Schema({ //creating schema
  blogTitle: String,
  blogPost: String,
});
const postModel = mongoose.model('post', blogSchema);


async function fetchBlogFromDB() {
  console.log("inside main");
  posts = await postModel.find();
}

async function addBlogToDB(title, post) {
  const postModel = mongoose.model('post', blogSchema);
  const newBlog = new postModel({ blogTitle: title, blogPost: post });
  newBlog.save();
}

app.get("/", async (req, res) => {
  await fetchBlogFromDB().catch(console.dir);
  // console.log("rendering home");
  // console.log(posts);
  // console.log(posts.length);
  res.render("home.ejs", { content: homeStartingContent, posts: posts });
});

app.get("/about", (req, res) => {
  res.render("about.ejs", { content: aboutContent });
});

app.get("/post/:id", (req, res) => {
  let requested_id = req.params.id;
  posts.forEach(function (post) {
    if (requested_id == post._id) {
      res.render("post.ejs", { posts: post });
    }
  });
  res.render("post.ejs", { entered_post_name: "This Post is Not Available" });

});

app.get("/contact", (req, res) => {
  res.render("contact.ejs", { content: contactContent });
});

app.get("/compose", (req, res) => {
  res.render("compose.ejs");
});

app.post("/submitCompose", async (req, res) => {
  let newPost = {
    title: req.body.title,
    post: req.body.post
  }
  await addBlogToDB(newPost.title, newPost.post);
  res.redirect("/");

});

app.get("/delete/:id",async (req, res)=>{
    let requested_id=req.params.id;
    await postModel.deleteOne({_id:requested_id});
    res.redirect("/");
});

app.get("/update/:id",async (req, res)=>{
  let requested_id=req.params.id;
  let post=await postModel.find({_id:requested_id});
  res.render("compose.ejs",{post:post[0]});
});

app.post("/updateBlog",async (req,res)=>{
  let requested_id=req.body.id;
  let newPost = {
    title: req.body.title,
    post: req.body.post
  }
  await postModel.updateOne({_id:requested_id},{blogTitle:newPost.title,blogPost:newPost.post});
  res.redirect("/");
});


app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
