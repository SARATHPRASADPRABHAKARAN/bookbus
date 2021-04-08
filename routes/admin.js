const { compareSync } = require("bcrypt");
const { response } = require("express");
var express = require("express");
var router = express.Router();
var session = require("express-session");
const userhelper = require("../Helpers/userhelper");
const moment = require("moment");
const today = moment();
const voucher_codes = require('voucher-code-generator');
var base64ToImage = require("base64-to-image");
const { getallCategory } = require("../Helpers/userhelper");
const { report } = require("./users");

var valurs = { name: "sarath", password: "12345" };

/* GET home page. */
router.get("/admin", async function (req, res, next) {
  let session = req.session.username;
  
  if (session) {
    let shipped = await userhelper.totalshippedoders();
    let orders = await userhelper.totalorders();
    let canceled = await userhelper.totalcanseledoders();
    let Revennue = await userhelper.totalRevenue();
    let delivered = await userhelper.totalDeliveredoders();
    
    
    
    
    res.render("admin/adminhome", {
      admin: true,
      orders,
      canceled,
      shipped,
      delivered,
      Revennue
    });
  } else {
    res.render("admin/adminlogin", { err: req.session.logginerr, no: true });
    req.session.logginerr = false;
  }
});

//login
router.post("/adminlogin", function (req, res) {
  
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
  
  req.session.username = null;

  res.redirect("/admin");
});

//edit user

router.get("/useredit/:id", async (req, res) => {
  let session = req.session.username;
  

  if (session) { 
    
    let proid = req.params.id;
    let product = await userhelper.getoneData(proid);
    
    res.render("admin/edituser", { product, admin: true });
  } else {
    res.redirect("/admin");
  }
});

router.post("/edituser/:id", (req, res) => {
  let proid = req.params.id;
  

  userhelper.updateData(proid, req.body).then((data) => {
    
    res.redirect("/usermanage");
  });
});

//usermanage

router.get("/usermanage", (req, res) => {
  
  let session = req.session.username;
  

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
  
  let sess = req.session.username;
  if (sess) {
    userhelper.unblockuser(req.params.id).then((data) => {
      
      res.redirect("/usermanage");
    });
  } else {
    res.redirect("/admin");
  }
});

//addproduct
router.get("/addproduct", (req, res) => {
  let session = req.session.username;
  

  if (session) {
    userhelper.getallCategory().then((data) => {
      
      res.render("admin/addproduct", { no: true, data });
    });
  } else {
    res.redirect("/admin");
  }
});

router.post("/addproduct", (req, res) => {
  let session = req.session.username;
  

  if (session) {



    
  
    req.body.price = parseInt(req.body.price);
    userhelper.addproduct(req.body, (id) => {
      let image = req.files.image;
      let image2=req.files.image2
      let image3=req.files.image3

      var base64Str = req.body.base1;
      var base64Str1 = req.body.base2;
      var base64Str2 = req.body.base3;


       delete req.body.base1
       delete req.body.base2
       delete req.body.base3


      if(base64Str1){
        
      }
      if(base64Str2){
        
      }
      

      var path = "./public/product-images/";
      var optionalObj = { fileName: id, type: "jpg" };
      var optionalObj2 = { fileName: id+'2', type: "jpg" };
      var optionalObj3 = { fileName: id+'3', type: "jpg" };


      base64ToImage(base64Str, path, optionalObj);
      base64ToImage(base64Str1, path, optionalObj2);
      base64ToImage(base64Str2, path, optionalObj3);



      // image.mv("./public/product-images/" + id + ".jpg", (err) => {
      //   console.log("errr b4");
      //   if (!err) {
      //     console.log("no err");

      //     res.render("admin/addproduct");
      //   } else {
      //     console.log("err", err);
      //   }
      // });
      res.redirect("/productmanage");
    });
  } else {
    res.redirect("/admin");
  }
});

router.get("/productmanage", async (req, res) => {
  let session = req.session.username;
  

  if (session) {
    
    let products = await userhelper.getallproducts();

    res.render("admin/productmanage", { admin: true, products });
    
  } else {
    res.redirect("/admin");
  }
});

//edit product

router.get("/editproduct/:id", async (req, res) => {
  let session = req.session.username;
  

  if (session) {
    
    let proid = req.params.id;
    let product = await userhelper.getproductbyId(proid);
    let getcategory = await userhelper.getallCategory();
    
    res.render("admin/editProduct", { product, admin: true, getcategory });
  } else {
    res.redirect("/admin");
  }
});

router.post("/editproduct/:id", (req, res) => {
  let proid = req.params.id;
  
  req.body.price = parseInt(req.body.price);
  userhelper.updateproduct(proid, req.body).then((product) => {
    if (req.files.image == null) {
      
      res.redirect("/productmanage");
    } else {
      let image = req.files.image;

      if (image) {
        image.mv("./public/product-images/" + proid + ".jpg", (err) => {
          
          if (!err) {
            
            res.redirect("/productmanage");
          } else {
            
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

router.get("/adminorder", async (req, res) => {
  let orders = await userhelper.admingetallOrders();
  res.render("admin/admin-order", {
    admin: req.session.username,
    ses: true,
    orders,
  });
});

router.post("/orderstatus", async (req, res) => {

  let status1 = req.body.statusis;
  let status = await userhelper
    .statusChange(req.body.id, status1)
    .then((response) => {
      
      res.json({ response });
    });
});

router.get("/sales-report",async (req, res) => {
let report= await userhelper.admingetallOrders();


  res.render("admin/sales-report", { admin: req.session.username ,report});
});

router.post("/sales-report", async (req, res) => {
  let fromDate = "" + req.body.fromdate;
  let toDate = "" + req.body.todate;
  let report = await userhelper.salesReport(fromDate, toDate);
  res.render("admin/sales-report", { admin: true, report });
});




//offermanagement
router.get('/offermanage',async(req,res)=>{

  let offer=await userhelper.viewOffers()
  res.render('admin/offermanage',{admin:true,offer })
})






//addoffer(product)

router.get('/addoffer-product',async(req,res)=>{
 let product=await userhelper.getallproducts()
  res.render('admin/addoffer',{admin:true,product})
})



router.post('/addoffer-product', async(req,res)=>{
let proId=req.body.bookname
let data= req.body

  let offer=await userhelper.addOfferToProduct(proId,data)
         res.redirect('/offermanage')
})



//addoffer-(catagory)

router.get('/addoffer-category',async(req,res)=>{
  let category=await userhelper.getallCategory()
res.render('admin/addoffer-catagory',{admin:true,category})
})


router.post('/addoffer-category',async(req,res)=>{
  let data=req.body
  let category=req.body.category
  let offer=await userhelper. addOfferToCategory(category, data)
  res.redirect('/offermanage')
})


//delete offer

router.get('/deleteoffer/:id',async(req,res)=>{
  let Proid = req.params.id;


 let dele = await userhelper.deleteOffer(Proid)
 res.redirect('/offermanage')
})





//coupen




router.get('/coupen-manage',(req,res)=>{
  userhelper.getcoupon().then((coupons) => {
  res.render('admin/coupen-manage',{admin:true,coupons})
})
})



router.get('/new-coupon',(req,res)=>{
  res.render('admin/newcoupen',{admin:true})
})









router.get('/generate-couponCode', (req, res) => {

  let voucher = voucher_codes.generate({
    length: 8,
    count: 1
  })
  let voucherCode = voucher[0]
  res.send(voucherCode)
})

router.post('/new-coupon', async (req, res) => {

  let coupon = req.body.coupon
  let offer = req.body.offer

  await userhelper.createCoupons(offer, coupon).then(() => {
    res.redirect('/coupen-manage')
  })

})



router.get('/delete-coupon/:id', async (req, res) => {

  await userhelper.deactivateCoupon(req.params.id).then(() => {
    res.redirect('/coupen-manage')
  })

})





















router.get("/test", (req, res) => {
  res.render("admin/testing", { no: true });
});

module.exports = router;
