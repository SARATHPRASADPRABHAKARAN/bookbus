var express = require("express");
var router = express.Router();
const userHelper = require("../Helpers/userhelper");
const session = require("express-session");

/* GET users listing. */
router.get("/", function (req, res) {
  let session = req.session.user;
  console.log("session und", session);
  let nosession = req.session.logginerr;
  if (session) {
    userHelper.getallproducts().then((products) => {
      console.log("**", products);
      res.render("user/userhome", { user: true, ses: true, products });
    });
  } else if (nosession) {
    res.render("user/userlogin", { no: true, err: req.session.logginerr });
    req.session.logginerr = false;
  } else {
    userHelper.getallproducts().then((products) => {
      console.log("sarath how are you", products);

      res.render("user/userhome", { user: true, products });
    });
  }
});

//signup
router.get("/signup", function (req, res) {
  res.render("user/usersignup", { no: true });
});
router.post("/signup", function (req, res) {
  userHelper.dosignup(req.body).then((response) => {
    console.log("signup ayi");
    console.log(response);
    res.redirect("/login");
  });
});


//login

router.get("/login", function (req, res, next) {
  let session = req.session.user;
  if (session) {
    res.redirect("/");
  } else {
    res.render("user/userlogin", { no: true });
  }
});

router.post("/login", function (req, res) {

  userHelper.dologin(req.body).then((response) => {
    req.session.user=response.user
    console.log(response);
    res.send(response)
  });
});



//user detatis

router.get("/view-single/:id", (req, res) => {
  let userfound = req.session.user;
  console.log("id ", req.params.id);
  let proId = req.params.id;
  let result = userHelper.showSingleProduct(proId).then((product) => {
    if (userfound) {
      
      res.render("user/productdetails", {
        userfound,
        product,
        user: true,
        ses: true,
      });
    } else {

      console.log("sss", product);
      res.render("user/productdetails", { product, user: true });
    }
  });
});

//logout
router.get("/logout", (req, res) => {
  console.log("hai");
  //session destroy
  // req.session.destroy()
  req.session.user = null;

  res.redirect("/");
});

module.exports = router;
