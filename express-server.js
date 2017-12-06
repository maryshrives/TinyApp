const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString(n){
  const charSet = "1234567890abcdefghijklmnopqrstuvwxyz";
  let randomString = "";
  for (var i = 0; i < n; i++){
    let rnum = Math.floor(Math.random() * charSet.length);
    randomString += charSet[rnum];
  }
  return randomString;
};
// console.log(generateRandomString(6));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "v1k6e9": "http://www.twitter.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
//login functionality
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls/');
})

app.post('/logout', (req, res) => {
  username = '';
  res.clearCookie('username');
  res.redirect('/urls');
})

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                        username: req.cookies["username"], };
  res.render("urls-index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls-new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        urls: urlDatabase,
                        username: req.cookies["username"] };
  res.render("urls-show", templateVars);
});

app.post("/urls", (req, res) => {
  let randomURL = generateRandomString(6);
  urlDatabase[randomURL] = req.body.longURL;
  console.log(urlDatabase);
  console.log(req.body);  // debug statement to see POST parameters
  res.redirect("/urls/" + randomURL);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  let deleteID = req.params.id;
  delete urlDatabase[deleteID];
  console.log("URL has been deleted");
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  let longUrl = req.body.longUrl;
  let shortURL = req.params.id;
  urlDatabase[shortURL] = longUrl;
  console.log(longUrl);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase)
  let longURL = urlDatabase[req.params.shortURL]
  console.log(longURL);
  res.redirect(longURL);
});










