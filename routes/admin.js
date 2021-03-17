const { compareSync } = require("bcrypt");
var express = require("express");
var router = express.Router();
var session = require("express-session");
const userhelper = require("../Helpers/userhelper");

var valurs = { name: "sarath", password: "12345" };

/* GET home page. */
router.get("/admin", function (req, res, next) {
  let session = req.session.username;
  console.log("iuytgyujghb", session);
  if (session) {
    res.render("admin/adminhome", { admin: true });
  } else {
    res.render("admin/adminlogin", { err: req.session.logginerr, no: true });
    req.session.logginerr = false;
  }
});





//login
router.post("/adminlogin", function (req, res) {
  console.log("evide ethi");
  var username = req.body.username;
  var password = req.body.password;
  if (username == valurs.name && password == valurs.password) {
    req.session.username = req.body.username;

    res.redirect("/admin");
  } else {
    req.session.logginerr = true;
    res.redirect("/admin");
  }
});





//logout
router.get("/logout2", (req, res) => {
  console.log("hai");
  req.session.username = null;

  res.redirect("/admin");
});





//edit user

router.get("/useredit/:id", async (req, res) => {
  let session = req.session.username;
  console.log(session);

  if (session) {
    console.log("parasad");
    let proid = req.params.id;
    let product = await userhelper.getoneData(proid);
    console.log(product);
    res.render("admin/edituser", { product, admin: true });
  } else {
    res.redirect("/admin");
  }
});




router.post("/edituser/:id", (req, res) => {
  let proid = req.params.id;
  console.log(req.body);

  userhelper.updateData(proid, req.body).then((data) => {
    console.log(data);
    res.redirect("/usermanage");
  });
});




//usermanage

router.get("/usermanage", (req, res) => {
  console.log("sarath");
  let session = req.session.username;
  console.log(session);

  if (session) {
    userhelper.getdata().then((data) => {
      res.render("admin/usermanage", { admin: true, data });
    });
  } else {
    res.render("admin/adminlogin", { no: true });
  }
});





//userdelete

router.get("/delete/:id", (req, res) => {
  let Proid = req.params.id;
  userhelper.deleteData(Proid).then((response) => {
    res.redirect("/usermanage");
  });
});



//block

router.get("/block/:id", (req, res) => {
  let sess = req.session.username;
  if (sess) {
    userhelper.blockuser(req.params.id).then(() => {
      res.redirect("/usermanage");
    });
  } else {
    res.redirect("/admin");
  }
});





//unblock

router.get("/unblock/:id", (req, res) => {
  console.log("user");
  let sess = req.session.username;
  if (sess) {
    userhelper.unblockuser(req.params.id).then((data) => {
      console.log(data);
      res.redirect("/usermanage");
    });
  } else {
    res.redirect("/admin");
  }
});




//addproduct
router.get("/addproduct", (req, res) => {
  let session = req.session.username;
  console.log(session);

  if (session) {
    userhelper.getallCategory().then((data) => {
      console.log("data", data);
      res.render("admin/addproduct", { admin: true, data });
    });
  } else {
    res.redirect("/admin");
  }
});




router.post("/addproduct", (req, res) => {
  let session = req.session.username;
  console.log(session);

  if (session) {
    console.log("FHHGC");
    console.log("req", req.body);

    userhelper.addproduct(req.body, (id) => {
      let image = req.files.image;
      console.log(req.files.image);

      image.mv("./public/product-images/" + id + ".jpg", (err) => {
        console.log("errr b4");
        if (!err) {
          console.log("no err");

          res.render("admin/addproduct");
        } else {
          console.log("err", err);
        }
      });
      res.redirect("/productmanage");
    });
  } else {
    res.redirect("/admin");
  }
});




router.get("/productmanage", async (req, res) => {
  let session = req.session.username;
  console.log(session);

  if (session) {
    console.log("sarath");
    let products = await userhelper.getallproducts();

    res.render("admin/productmanage", { admin: true, products });
    console.log("uhiu");
  } else {
    res.redirect("/admin");
  }
});




//edit product

router.get("/editproduct/:id", async (req, res) => {
  let session = req.session.username;
  console.log(session);

  if (session) {
    console.log("parasad");
    let proid = req.params.id;
    let product = await userhelper.getproductbyId(proid);
    let getcategory = await userhelper.getallCategory();
    console.log(product);
    res.render("admin/editProduct", { product, admin: true, getcategory });
  } else {
    res.redirect("/admin");
  }
});




router.post("/editproduct/:id", (req, res) => {
  let proid = req.params.id;
  console.log("haii", req.body);
  userhelper.updateproduct(proid, req.body).then((product) => {
    if (req.files.image == null) {
      console.log("yhgfv");
      res.redirect("/productmanage");
    } else {
      let image = req.files.image;

      if (image) {
        image.mv("./public/product-images/" + proid + ".jpg", (err) => {
          console.log("errr b4");
          if (!err) {
            console.log("no err");
            res.redirect("/productmanage");
          } else {
            console.log("err", err);
          }
        });
      } else {
        res.redirect("/productmanage");
      }
    }
  });
});





router.get("/delete-product/:id", (req, res) => {
  let Proid = req.params.id;
  userhelper.deleteProduct(Proid).then((response) => {
    res.redirect("/productmanage");
  });
});

router.get("/category-manage", (req, res) => {
  let session = req.session.username;
  console.log(session);

  if (session) {
    userhelper.getallCategory().then((data) => {
      res.render("admin/category-manage", { admin: true, data });
    });
  } else {
    res.redirect("/admin");
  }
});




router.get("/add-category", (req, res) => {
  let session = req.session.username;
  console.log(session);

  if (session) {
    res.render("admin/add-category", { admin: true });
  } else {
    res.redirect("/admin");
  }
});

router.post("/add-category", (req, res) => {
  userhelper.addCategory(req.body).then(() => {
    res.redirect("/category-manage");
  });
});




router.get("/delete-category/:id", (req, res) => {
  userhelper.deleteCategory(req.params.id).then(() => {
    res.redirect("/category-manage");
  });
});

module.exports = router;
