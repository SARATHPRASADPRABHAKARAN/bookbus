var express = require("express");
var router = express.Router();
const userHelper = require("../Helpers/userhelper");
const session = require("express-session");
const { Db } = require("mongodb");
const { response } = require("express");
const { post } = require("./admin");
const config = require("../conection/otp");
const {
  DeactivationsList,
} = require("twilio/lib/rest/messaging/v1/deactivation");
const client = require("twilio")(
  "AC4192358acfae0a86647cb2b7d1491091",
  "e805167b5b2c5565949e56e880806560"
);
var phone;
/* GET users listing. */
router.get("/", async function (req, res) {
  let session = req.session.user;

  let nosession = req.session.logginerr;
  if (session) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
    userHelper.getallproducts().then((products) => {
     


      res.render("user/userhome", {
        user: true,
        ses: true,
        products,
        cartCount,
        cart: true
        
      });
    });
  } else if (nosession) {
    res.render("user/userlogin", { no: true, err: req.session.logginerr });
    req.session.logginerr = false;
  } else {
    userHelper.getallproducts().then((products) => {
      res.render("user/userhome", { user: true, products });
    });
  }
});

//middlewear verify
const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};

//signup
router.get("/signup", function (req, res) {
  res.render("user/usersignup", { no: true });
});
router.post("/signup", function (req, res) {
  userHelper.dosignup(req.body).then((response) => {
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
    req.session.user = response.user;

    res.send(response);
  });
});

//user detatis

router.get("/view-single/:id", (req, res) => {
  let userfound = req.session.user;

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
      res.render("user/productdetails", { product, user: true ,cart:true ,ses:true});
    }
  });
});

//logout
router.get("/logout", (req, res) => {
  //session destroy
  // req.session.destroy()
  req.session.user = null;

  res.redirect("/");
});

router.get("/cart", verifyLogin, async (req, res) => {
  var user = req.session.user;
  
  let products = await userHelper.getCartProducts(req.session.user._id);
  if(products.length===0){
    res.redirect('/')
  }
   
  else{
  
  let total = await userHelper.getTotalAmount(req.session.user._id);

  res.render("user/cart", { user, products, ses: true, total });
  }


   
});

router.get("/usercart/:id", (req, res) => {
  userHelper.addcart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

router.post("/change-quantity", (req, res, next) => {
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    if (response.status) {
      response.subtotal = await userHelper.subTotalAmount(
        req.body.user,
        req.body.product
      );
      response.total = await userHelper.getTotalAmount(req.body.user);
      res.json(response);
    } else {
      res.json(response);
    }
  });
});

router.post("/deleteCartProduct", (req, res) => {
  userHelper.deleteCartProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/placeorder", verifyLogin, async (req, res) => {
  let total = await userHelper.getTotalAmount(req.session.user._id);

  let addresss = await userHelper.getAllAddress();

  res.render("user/checkout", {
    total,
    ses: true,
    addresss,
    user: req.session.user._id,
  });
});

router.post("/placeorder", async (req, res) => {
  let products = await userHelper.getCartProductList(req.body.userId);
  let total = req.body.total;

  userHelper.placeOrder(req.body, products, total).then((oderId) => {
    if (req.body.payment == "COD") {
      let response = {};

      res.json({ codSuccess: true });
    } else if (req.body.payment === "PAY PAL") {
      res.json({ paypal: true, total });
    } else {
      userHelper.generateRazorpay(oderId, total).then((response) => {
        res.json({ response });
      });
    }
  });
});

router.get("/add-address", (req, res) => {
  res.render("user/add-address", { user: req.session.user._id });
});

router.post("/add-address", verifyLogin, (req, res) => {
  userHelper.addAddress(req.body).then(() => {
    res.redirect("/placeorder");
  });
});

router.get("/success", (req, res) => {
  res.render("user/success", { ses: true, user: req.session.user });
});

router.get("/vieworder", verifyLogin, async (req, res) => {
  let orders = await userHelper.getallOrders(req.session.user._id);

  res.render("user/orderlist", { user: req.session.user, ses: true, orders });
});

router.get("/viewproducts/:id", async (req, res) => {
  let products = await userHelper.getorderProducts(req.params.id);
  res.render("user/viewproducts", {
    user: req.session.user,
    products,
    ses: true,
  });
});

router.post("/verifypayment", (req, res) => {
  userHelper
    .verifyPayment(req.body)
    .then(() => {
      userHelper
        .chagePaymentStatus(req.body["order[response][receipt]"])
        .then(() => {
          res.json({ status: true });
        });
    })
    .catch((err) => {
      res.json({ status: false });
    });
});

//OTP Login

router.post("/otplogin", (req, res) => {
  let mobile = parseInt(req.body.Mobile);
  phone = mobile;

  let response = {};
  userHelper.Mobliecheck(mobile).then((response) => {
    if (response.status == true) {
      client.verify
        .services("VA7cbc13e1ac35fb926ccd3a998b8886f5")
        .verifications.create({
          to: `+91${mobile}`,
          channel: "sms",
        })
        .then((data) => {
          response.otp = true;

          res.json({ response });
        })
        .catch((err) => {});
    } else {
      res.json({ response });
    }
  });
});

// router.post('/otplogin',(req,res)=>{
// let mobile =req.body.Mobile
// console.log("Mobilr",mobile)
// let response={}
// userHelper.Mobliecheck(mobile).then(()=>{
//   client
//   .verify
//   .services(config.serviceID)
//  .create({
//    to:'91'+mobile,
//    channel:"sms"
//  })
//  .then((data)=>{
//    response.data=data
//    response.otp=true
//    res.json({number:true})
//  })
// })

// })

router.post("/otpsubmit", (req, res) => {
  let otp = parseInt(req.body.otp);
  let response = {};

  client.verify
    .services("VA7cbc13e1ac35fb926ccd3a998b8886f5")
    .verificationChecks.create({
      to: `+91${phone}`,
      code: otp,
    })
    .then((data) => {
      userHelper.getUserByMobile(phone).then((user) => {
        response.data = data;
        response.otp = true;
        req.session.user = user;
        res.json({ otp: true });
      });
    });
});

//Profile

router.get("/profile", verifyLogin, async (req, res) => {
  let details = await userHelper.alldetails(req.session.user._id);
  let addresss = await userHelper.getAllAddress();
  console.log('ssssssssssssssssssssss',addresss)

  res.render("user/profile", { user: req.session.user, details, ses: true,addresss,'psdSuccess': req.session.passwordChangeSuccess, 'psdFailure': req.session.passwordChangeFailure});
  req.session.passwordChangeSuccess = false
    req.session.passwordChangeFailure = false
});






router.post("/verifyCoupon", (req, res) => {
  let coupon = req.body.coupon;
  let user = req.body.user;
  console.log("dey ith ivid undo", req.body);
  userHelper.verifyCoupon(coupon, user).then((response) => {
    res.json(response);
  });
});




router.get('/category1',async(req,res)=>{
  let category1="Biography"
  console.log('eeeeeeeeeeeeee',category1)
  let products =await userHelper.getcategory1(category1)
  res.render('user/category1',{user:true,products})
})

router.get('/category2',async(req,res)=>{
  let category1="History"
  console.log('eeeeeeeeeeeeee',category1)
  let products =await userHelper.getcategory1(category1)
  res.render('user/category2',{user:true,products})
})
router.get('/category3',async(req,res)=>{
  let category1="Fiction"
  console.log('eeeeeeeeeeeeee',category1)
  let products =await userHelper.getcategory1(category1)
  res.render('user/category3',{user:true,products})
})

router.get('/category4',async(req,res)=>{
  let category1="Fantasy"
  console.log('eeeeeeeeeeeeee',category1)
  let products =await userHelper.getcategory1(category1)
  res.render('user/category4',{user:true,products})
})









router.post('/search', (req, res) => {

  let keyword = req.body.search
  let userfound = req.session.user
   


  userHelper.searchProduct(keyword).then((products) => {
    if (userfound) {
      res.render('user/allproducts', { products, userfound,user:true })
    }
    else {
      res.render('user/allproducts', { products ,user:true})
    }
  }).catch(() => {

    if (userfound) {
      res.render('user/allproducts', { noproducts: true, userfound,user:true })
    }
    else {
      res.render('user/allproducts', { noproducts: true, user:true})
    }
  })
})


router.get('/editaddress/:id',async(req,res)=>{
  let Proid = req.params.id;
  addressone= await userHelper.getoneaddress(Proid)
console.log(addressone);

res.render('user/editaddress',{user:true,Proid,addressone})

 })



 router.post('/editaddress/:id',async(req,res)=>{
   let id=req.params.id;
   console.log('sssssssssssssssss',req.body);
   let data=req.body
   address=userHelper.editaddress(id,data)
   console.log('fffffffffffffffffffffffff',address);
   
   res.redirect('/profile')
 })




 router.post('/changePassword', (req, res) => {
  console.log(req.body)
  userHelper.changePassword(req.body, req.session.user._id).then((response) => {
    if (response.success) {
      req.session.passwordChangeSuccess = "Password Has Been Updated Successfully"
      res.redirect('/profile')
    }
    if (response.failure) {
      req.session.passwordChangeFailure = "You have entered Incorrect Password"
      res.redirect('/profile')
    }
  })
})










module.exports = router;
