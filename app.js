var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("express-handlebars");
var session = require("express-session");
const dotenv = require("dotenv").config();

var adminRouter = require("./routes/users");
var usersRouter = require("./routes/admin");
const { handlebars } = require("hbs");
var db = require("./conection/config");
var app = express();
const fileUpload = require("express-fileupload");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs({
    helpers: {
      ifEquals: function (arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      },
    },
    extname: "hbs",
    defaultLayout: "layout",
    layoutDir: __dirname + "/views/layout/",
    partialDir: __dirname + "/views/partials/",
  })
);
app.use(logger("dev"));
app.use(express.json());

app.use(
  session({
    key: "sarath",
    secret: "key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000000000 },
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));
app.use(express.static("/public"));
app.use(express.static("/public/product-images"));

app.use(fileUpload());
app.use(express.static("/public/product-images"));
db.conect((err) => {
  if (err) console.log("conction error");
  else console.log("Database conected");
});

app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use("/", adminRouter);
app.use("/", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).send('<h1>404 Page Not Found</h1>')
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
