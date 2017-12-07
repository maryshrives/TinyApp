const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
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

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userID" },
  "v1k6e9": { longURL: "http://www.twitter.com", userID: "userID" },
  "x6pmyi": { longURL: "http://www.twitter.com", userID: "user2ID" },
  "ilgpba": { longURL: "http://www.facebook.com", userID: "user2ID" }
};

const users = {
  "userID": {
    id: "userID",
    email: "user@example.com",
    password: "purple"
  },
 "user2ID": {
    id: "user2ID",
    email: "user2@example.com",
    password: "green"
  }
}


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
//get register endpoint
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {

  let email = req.body["email"];
  let password = req.body["password"];
  let id = generateRandomString(6);

  if (email === '' || password === '') {
    return res.status(400).send("ERROR: Please enter a valid email and password");
  }
  else {
    for (let user in users){
      if (email === users[user].email) {
        return res.status(400).send("ERROR: This email is already registered")
      }
    }
  }
  users[id] = {
    id,
    email,
    password
  };


  res.cookie("user_id", id);
  res.redirect("/urls");
  console.log(users);


});

// app.get("/register", (req,res) => {
//   if (!res.cookie("user_id"))
//     res.render("register");
//   else
//     res.redirect("/urls");
// });
//login functionality
app.get('/login', (req, res) => {
  res.render('login');
});

app.post("/login", (req, res) => {
  let email = req.body["email"];
  let password = req.body["password"];
  // res.cookie("user_id", req.body.user_id);
    if (email === "" || password === ""){
    res.status(403).send("please enter email and password");
  }

  console.log("email", email, "password", password);
  console.log("users", users);

//error handling - verify password
  for (let user in users) {
  // Object.keys(users).forEach(function(user) {
    if (email === users[user].email){
      if (password === users[user].password){
        // set cookie to user
        res.cookie("user_id", user);
        res.redirect("/urls");
        return;
      } else {
        res.status(403).send("password doesn't match!");
        return;
      }
    }
  };

  res.status(403).send("email doesn't exist, please register!");
});

app.post("/logout", (req, res) => {
  user_id = "";
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    var myURLs = {};
    for (let shortURL in urlDatabase) {
      if(urlDatabase[shortURL].userID === req.cookies["user_id"]) {
        myURLs[shortURL] = urlDatabase[shortURL]
      }
    }

    let templateVars = { urls: myURLs,
                          user: users[req.cookies["user_id"]] };
                          // user: users["userID"], };
    res.render("urls-index", templateVars);
  } else {
    res.redirect("/login");
  }


});

app.get("/urls/new", (req, res) => {

  let templateVars = { user: users[req.cookies["user_id"]] };
  if (req.cookies["user_id"])
    res.render("urls-new", templateVars);
  else
    res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  var url = urlDatabase[shortURL];
  if (req.cookies["user_id"] && url.userID === req.cookies["user_id"]) {
    urlDatabase[shortURL] = { longURL: req.body.longUrl, userID: req.cookies["user_id"] };
    res.redirect("/urls");
  } else {
    res.status(401).send("You are not authorized to delete this URL.");
  }

  let templateVars = { shortURL: req.params.id,
                        urls: urlDatabase,
                        user: users[req.cookies["user_id"]] };
                        // user: users["userID"] };
  res.render("urls-show", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.status(403).send("Please login or register.");
  }
  let randomURL = generateRandomString(6);
  urlDatabase[randomURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  // console.log("msg 1: " + urlDatabase);
  // console.log("msg 2: " + req.body);
  res.redirect("/urls/");
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;

  var url = urlDatabase[shortURL];
  if (req.cookies["user_id"] && url.userID === req.cookies["user_id"]) {
    urlDatabase[shortURL] = { longURL: req.body.longUrl, userID: req.cookies["user_id"] };
    res.redirect("/urls");
  } else {
    res.status(401).send("You are not authorized to delete this URL.");
  }

  let deleteID = req.params.id;
  delete urlDatabase[deleteID];
  console.log("URL has been deleted");
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.params.id;
  var url = urlDatabase[shortURL];

  if (req.cookies["user_id"] && url.userID === req.cookies["user_id"]) {
    urlDatabase[shortURL] = { longURL: req.body.longUrl, userID: req.cookies["user_id"] };
    res.redirect("/urls");
  } else {
    res.status(401).send("You are not authorized to edit this URL.");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/u/:shortURL", (req, res) => {
  console.log("msg 4: " + urlDatabase)
  let longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log("msg 5: " + longURL);
  res.redirect(longURL);
});










