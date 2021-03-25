var express = require("express");
var router = express.Router();
const userHelper = require("../Helpers/userhelper");
const session = require("express-session");
const { Db } = require("mongodb");
const { response } = require("express");
const { post } = require("./admin");

/* GET users listing. */
router.get("/",async function (req, res) {
  let session = req.session.user;
  console.log("session und", session);
  let nosession = req.session.logginerr;
  if (session) {
    cartCount= await userHelper.getCartCount(req.session.user._id)
    userHelper.getallproducts().then((products) => {
      
      res.render("user/userhome", { user: true, ses: true, products,cartCount,cart:true });
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

//middlewear verify
const verifyLogin=(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
  res.redirect('/')
  }
}

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




router.get('/cart',verifyLogin,async(req,res)=>{
  console.log("kjsh");
  var user=req.session.user
  let products=await userHelper.getCartProducts(req.session.user._id)
  let total=await userHelper.getTotalAmount(req.session.user._id)
  
  console.log("dkjdkjdkjdkjd",products)
  res.render('user/cart',{user,products,ses:true,total})
})






router.get("/usercart/:id",(req,res)=>{
  console.log('sarath')
  userHelper.addcart(req.params.id,req.session.user._id).then(()=>{
  console.log('sarath prasad')
    res.json({status:true})
  })
  
})



router.post("/change-quantity",(req,res,next)=>{
  console.log(req.body)
  userHelper.changeProductQuantity(req.body).then(async(response)=>{
    if(response.status){
    response.subtotal=await userHelper.subTotalAmount(req.body.user,req.body.product)
    response.total=await userHelper.getTotalAmount(req.body.user)
    res.json(response)
    }
    else{
      res.json(response)

    }
  })
})




router.post("/deleteCartProduct",(req,res)=>{
  console.log("ethi ",req.body);

  userHelper.deleteCartProduct(req.body).then((response)=>{
   
    res.json(response)
  })
})



router.get('/placeorder',verifyLogin ,async(req,res)=>{
  let total=await userHelper.getTotalAmount(req.session.user._id)
  console.log("user",req.session.user._id)
  let addresss= await userHelper.getAllAddress()
  console.log(addresss)
    res.render("user/checkout", {
      total,
      ses:true,
      addresss,
      user:req.session.user 
    });
  })




  router.post('/placeorder',async(req,res)=>{
    let products= await userHelper.getCartProductList(req.body.userId)
    let total=await userHelper.getTotalAmount(req.body.userId)
    userHelper.placeOrder(req.body,products,total).then((oderId)=>{
     if (req.body.payment=="COD"){
       let response={}
       
      res.json({codSuccess:true})
     }


     else if(req.body.payment==='PAY PAL'){

       console.log('eeeeeeee',req.body.payment)
       res.json({paypal:true,total})

     }
     else{
       userHelper.generateRazorpay(oderId,total).then((response)=>{
         console.log("hds",response);
         res.json({response})
       })
     }

    
    })
  })






router.get('/add-address',(req,res)=>{
  res.render('user/add-address',{user:req.session.user._id})
})

router.post('/add-address',verifyLogin,(req,res)=>{
  userHelper.addAddress(req.body).then(()=>{
  res.redirect('/placeorder')
  })
})


router.get('/success',(req,res)=>{
res.render('user/success',{ses:true,user:req.session.user})

})



  router.get('/vieworder',verifyLogin,async(req,res)=>{
 let orders= await userHelper.getallOrders(req.session.user._id)
   console.log(orders);
    res.render('user/orderlist',{user:req.session.user,ses:true,orders})
  })




router.get('/viewproducts/:id',async(req,res)=>{
  let products= await userHelper.getorderProducts(req.params.id)
 res.render('user/viewproducts', {user:req.session.user,products})
})

router.post('/verifypayment',(req,res)=>{
userHelper.verifyPayment(req.body).then(()=>{
  userHelper.chagePaymentStatus(req.body['order[response][receipt]']).then(()=>{
    res.json({status:true})
  })

}).catch((err)=>{
  res.json({status:false})
})
})



module.exports = router;
