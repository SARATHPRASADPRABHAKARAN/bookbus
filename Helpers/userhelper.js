var db = require("../conection/config");
var collection = require("../conection/conllection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
const moment = require('moment');

const { response } = require("express");
const { PRODUCT_COLLCTION } = require("../conection/conllection");
const Razorpay=require("razorpay");
const { resolve } = require("path");
var instance = new Razorpay({
  key_id: 'rzp_test_XV9PdEenLV2Ukw',
  key_secret: 'XSrJUiND4KzDpL0Ddfv2Oa46',
});

const paypal=require('paypal-rest-sdk');
const { ObjectID } = require("bson");
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AcUHtmgQT0KYFfzrWotGUlPCKjw1eWYdbWXH_zWeU1olFLWtUtocD4xnv4-jFC_BMKQlgVDYxOjP6CoM',
  'client_secret': 'ECf91rl3sy_AfJ6_pNGeEoA0z6VCaEqJj0QcvoT2_GZDgcjgEb3qnBEXpE6VaC9nJSMy6oyKhin9Q4FB'
});

module.exports = {
  dosignup: (userData) => {
    userData.status = 0;
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      let s = db
        .get()
        .collection(collection.USER_COLLCTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data.ops[0]);
        });
    });
  },

  dologin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLCTION)
        .findOne({ email: userData.email });
      if (user.block) {
      
        response.status = 4;
        resolve(response);
      } else {
        if (user) {
          bcrypt.compare(userData.password, user.password).then((result) => {
            if (result) {
              response.user = user;
              response.status = 1;
              
              resolve(response);
            } else {
              
              response.status = 2;
              resolve(response);
            }
          });
        } else {
          
          response.status = 3;
          resolve(response);
        }
      }
    });
  },

  getdata: () => {
    return new Promise(async (resolve, reject) => {
      let Product = await db
        .get()
        .collection(collection.USER_COLLCTION)
        .find()
        .toArray();
      
      resolve(Product);
    });
  },
  deleteData: (Proid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLCTION)
        .removeOne({ _id: objectId(Proid) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getoneData: (Proid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLCTION)
        .findOne({ _id: objectId(Proid) })
        .then((Product) => {
          resolve(Product);
        });
    });
  },

  updateData: (proid, data) => {
    let Number=parseInt(data.number)
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLCTION)
        .updateOne(
          { _id: objectId(proid) },
          {
            $set: {
              username: data.username,
              email: data.email,
              number: Number,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  addproduct: (userdata, callback) => {
    db.get()
      .collection(collection.PRODUCT_COLLCTION)
      .insertOne(userdata)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },

  getallproducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLCTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  getproductbyId: (productId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLCTION)
        .findOne({ _id: objectId(productId) })
        .then((data) => {
          resolve(data);
        });
    });
  },

  showSingleProduct: (proId) => {
    return new Promise(async (resolve, reject) => {
      
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLCTION)
        .findOne({ _id: objectId(proId) })
        .then((data) => {
          resolve(data);
        });
    });
  },




  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLCTION)
        .removeOne({ _id: objectId(productId) })
        .then((result) => {
          resolve(result);
        });
    });
  },

  updateproduct: (ProId, data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.PRODUCT_COLLCTION)
        .updateOne(
          { _id: objectId(ProId) },

          {
            $set: {
              bookname: data.bookname,
              authorname: data.authorname,
              category: data.category,
              price: data.price,
              language: data.language,
              discription: data.discription,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  deleteCategory: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY)
        .removeOne({ _id: objectId(productId) })
        .then((result) => {
          resolve(result);
        });
    });
  },

  addCategory: (userdata) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY)
        .insertOne(userdata)
        .then((data) => {
          resolve(data);
        });
    });
  },

  getallCategory: () => {

    return new Promise(async (resolve, reject) => {
      let data = 1;
      data = await db.get().collection(collection.CATEGORY).find().toArray();
      resolve(data);
    });
  },

  blockuser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let data = 1;
      data = await db
        .get()
        .collection(collection.USER_COLLCTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              block: 1,
            },
          }
        );
      resolve();
    });
  },

  unblockuser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let data = 1;
      data = await db
        .get()
        .collection(collection.USER_COLLCTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              block: 0,
            },
          }
        );
      resolve();
    });
  },

  addcart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART)
        .findOne({ user: objectId(userId) });

      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );

        if (proExist != -1) {
          db.get()
            .collection(collection.CART)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              { $inc: { "products.$.quantity": 1 } }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART)
            .updateOne(
              { user: objectId(userId) },
              { $push: { products: proObj } }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },




  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLCTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
              subtotal: {
                $multiply: [
                  { $arrayElemAt: ["$product.price", 0] },
                  "$quantity",
                ],
              },
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },





  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let Count = 0;
      let Cart = await db
        .get()
        .collection(collection.CART)
        .findOne({ user: objectId(userId) });
      if (Cart) {
        Count = Cart.products.length;
      }
      resolve(Count);
    });
  },





  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART)
          .updateOne(
            {
              _id: objectId(details.cart),
            },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then(() => {
            resolve({ status: true });
          });
      }
    });
  },





  deleteCartProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART)
        .updateOne(
          {
            _id: objectId(details.cart),
          },
          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },





  getTotalAmount: (userId) => {

    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },

          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLCTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },

          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },

          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ])
        .toArray();
      resolve(total[0].total);
    });
  },

  subTotalAmount: (userId, proId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLCTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          // {
          //   $project: {
          //     item: 1,
          //     quantity: 1,
          //     product: { $arrayElemAt: ["$product", 0] }
          //   }
          // },
          {
            $match: { item: objectId(proId) },
          },

          {
            $project: {
              _id: null,
              total: {
                $multiply: [
                  { $arrayElemAt: ["$product.price", 0] },
                  "$quantity",
                ],
              },
            },
          },
        ])
        .toArray();
      resolve(total[0].total);
    });
  },





  addAddress: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADRESS_COLLCTION)
        .insertOne({ details })
        .then((data) => {
          resolve(data.ops[0]._id);
        });
    });
  },





  getAllAddress: () => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.ADRESS_COLLCTION)
        .find()
        .toArray();
      resolve(address);
    });
  },




  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART)
        .findOne({ user: objectId(userId) });
      resolve(cart.products);
    });
  },




  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      let newdate=moment(new Date() ).format("YYYY/MM/DD")
      let status = order.payment === "COD" ? "placed" : "pending";
      let orderObj = {
        deliveyDetails: {
          name: order.firstname,
          address: order.address,
          pincode: order.pincode,
        },
        userId: objectId(order.userId),
        paymentmethod: order.payment,
        products: products,
        Totalamount: total,
        status: status,
        Date: newdate,
      };

      db.get()
        .collection(collection.ORDER_COLLCTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.CART)
            .removeOne({ user: objectId(order.userId) });
          resolve(response.ops[0]._id);
        });
    });
  },





  getallOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLCTION)
        .find({ userId: objectId(userId) })
        .toArray();
      resolve(orders);
    });
  },



getorderProducts: (proId) => {
  return new Promise(async (resolve, reject) => {
    let proItems = await db
      .get()
      .collection(collection.ORDER_COLLCTION)
      .aggregate([
        {
          $match: { _id: objectId(proId) },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: "$products.item",
            quantity: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLCTION,
            localField: "item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ["$product", 0] },
            subtotal: {
              $multiply: [
                { $arrayElemAt: ["$product.price", 0] },
                "$quantity",
              ],
            },
          },
        },
      ])
      .toArray();
    resolve(proItems);
  });
},


generateRazorpay:(orderId,total)=>{
  return new Promise((resolve,reject)=>{
    var options = {
      amount: parseInt(total)*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt:""+ orderId
    };
    instance.orders.create(options, function(err, order) {
      resolve(order)
    });
    

  })
},





verifyPayment:(details)=>{
  return new Promise((resolve,reject)=>{
    const crypto=require('crypto')
     let hmac= crypto.createHmac('sha256','XSrJUiND4KzDpL0Ddfv2Oa46')
    hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
    hmac=hmac.digest('hex')
    if(hmac==details['payment[razorpay_signature]']){
      resolve()
    }
    else{
      reject()
    }
  })
},




 

chagePaymentStatus:(orderId)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.ORDER_COLLCTION).updateOne({_id:objectId(orderId)},
    {
      $set:{status:'placed'}
    }).then(()=>{
      resolve()

  })
  
})
},


Mobliecheck:(mobile)=>{
  

  return new Promise(async(resolve,reject)=>{
    let num =await db.get().collection(collection.USER_COLLCTION).findOne({number:mobile})
  
    if(num){
      let response={}
      response.status=true
      resolve(response)
    }
    
    else if(num===null){
    
    
     resolve(response)
    }
  })
},




getUserByMobile:(phone)=>{
  return new Promise(async(resolve,reject)=>{
    let user = await db.get().collection(collection.USER_COLLCTION).findOne({number:phone})
    if(user){
      resolve(user)
    }
  })
},





admingetallOrders:()=>{
  return new Promise((resolve,reject)=>{
  let orders=  db.get().collection(collection.ORDER_COLLCTION).find().toArray()
  resolve(orders)
  
  })

},







statusChange:(proId,status1)=>{
  
  return new Promise(async(resolve,reject)=>{
     db.get().collection(collection.ORDER_COLLCTION).updateOne({_id:objectId(proId)},{$set:{status:status1}}).then((response)=>{
      
      resolve(response)

     })
  })
},





totalorders:()=>{
  return new Promise((resolve,reject)=>{
  let orders=  db.get().collection(collection.ORDER_COLLCTION).find().count()
  resolve(orders)
  })

},


 


totalcanseledoders:()=>{
return new Promise((resolve,reject)=>{
  let cansled= db.get().collection(collection.ORDER_COLLCTION).find({status:"canceled"}).count()
  resolve(cansled)
})
},





totalRevenue: () => {

  return new Promise(async (resolve, reject) => {

     let y = await db.get().collection(collection.ORDER_COLLCTION). aggregate([{
        $group: {
           _id: null,
           Totalamount: {
              $sum: "$Totalamount"
           }
        }
     }]).toArray()

     resolve(y)

  })
},

totalshippedoders:()=>{
  return new Promise((resolve,reject)=>{
    let cansled= db.get().collection(collection.ORDER_COLLCTION).find({status:"shipped"}).count()
    resolve(cansled)
  })
  },


  totalDeliveredoders:()=>{
    return new Promise((resolve,reject)=>{
      let cansled= db.get().collection(collection.ORDER_COLLCTION).find({status:"delivered"}).count()
      resolve(cansled)
    })
    },
  


 
alldetails:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    let details= await db.get().collection(collection.USER_COLLCTION).findOne({_id:objectId(userId)})
    resolve(details)
  })
},





salesReport:(fromdate,todate)=>{

  
  
  fromdate=moment(fromdate).format("YYYY/MM/DD")
  todate=moment(todate).format('YYYY/MM/DD')
  
  return new Promise(async(resolve,reject)=>{



    let salesReport = await db.get().collection(collection.ORDER_COLLCTION).aggregate([
      {
         $match: {
            Date: {
               $gte: fromdate,
               $lte: todate
            }
         }
      },
      {
         $project: {
            Totalamount: 1,
            paymentMethod: 1,
            status: 1,
            Date: 1,
            _id: 1

         }
      }
   ]).toArray()
   resolve(salesReport)
  
  })
},








addOfferToProduct: (proId, data) => {
  let discount = data.offer
  return new Promise(async(resolve, reject) => {


      await db.get().collection(collection.PRODUCT_COLLCTION).findOne({ _id: objectId(proId) }).then(async(product) => {


          let price = product.price
          let oldPrice = product.price
          let disc = 100 - discount
          new_amount = (disc * price) / 100;


       await  db.get().collection(collection.PRODUCT_COLLCTION).updateOne({ _id: ObjectID(proId) }, {
              $set: {
                  discount: data.offer,
                  oldPrice: oldPrice,
                  price: new_amount,
                  valid_from: data.datefrom,
                  valid_to: data.dateto
              }
          }).then((data) => {
        
            resolve(data)
              
          })
      })
  })

},





  viewOffers: () => {
    return new Promise((resolve, reject) => {


        db.get().collection(collection.PRODUCT_COLLCTION).find({ discount: { $exists: true } }).toArray().then((products) => {

            resolve(products)
        })
    })
},








addOfferToCategory: (category1, data) => {
  return new Promise(async (resolve, reject) => {
    
      
      let products = await db.get().collection(collection.PRODUCT_COLLCTION).find({ category:category1 }).toArray()
    

      
      let length = products.length
    

      for (i = 0; i < length; i++) {
          let offer = data.offer

          let discounted_rate = products[i].price - (products[i].price * offer) / 100

          let updated = db.get().collection(collection.PRODUCT_COLLCTION).updateOne({ _id: ObjectID(products[i]._id) }, {
              $set: {
                  discount: offer,
                  oldPrice: products[i].price,
                  price: discounted_rate,
                  valid_from: data.valid_from,
                  valid_to: data.valid_to
              }
          })


      }

      resolve()
  })
},



deleteOffer: (prodId) => {

  return new Promise(async (resolve, reject) => {

      let product = await db.get().collection(collection.PRODUCT_COLLCTION).findOne({ _id: ObjectID(prodId) })
      let price = product.oldPrice

      db.get().collection(collection.PRODUCT_COLLCTION).updateOne({ _id: ObjectID(prodId) }, {
          $set: {
              price: price
          }
      })


      db.get().collection(collection.PRODUCT_COLLCTION).updateOne({ _id: ObjectID(prodId) }, {
          $unset: {
              discount: 1,
              oldPrice: 1,
              valid_from: 1,
              valid_to: 1
          }
      })
      resolve()



  })
},



//coupon

createCoupons: (offer, coupon) => {
  return new Promise(async (resolve, reject) => {
     db.get().collection(collection.COUPON_COLLCTION).insertOne({ offer: offer, coupon: coupon, status: true }).then((result) => {
        resolve(result)
     })


  })
},





getcoupon: () => {
  return new Promise(async (resolve, reject) => {

     db.get().collection(collection.COUPON_COLLCTION).find().toArray().then((result) => {
        resolve(result)
     })
  })
},






deactivateCoupon: (couponId) => {
  return new Promise(async (resolve, reject) => {
     db.get().collection(collection.COUPON_COLLCTION).removeOne({ _id: ObjectID(couponId) }).then((result) => {
        resolve(result)
     })
  })
},











verifyCoupon: (coupon, user) => {


  return new Promise(async (resolve, reject) => {

      let response = {}
      let couponfound = await db.get().collection(collection.COUPON_COLLCTION).findOne({ coupon: coupon })
      if (couponfound) {

          if (couponfound.status) {
              response.status = 0
              db.get().collection(collection.COUPON_COLLCTION).updateOne({ coupon: coupon }, {
                  $set: {

                      status: false
                  }
              })
              db.get().collection(collection.COUPON_COLLCTION).updateOne({ _id: ObjectID(user) }, {
                  $unset: {
                      coupon: 1
                  }
              })

              response.offer = parseInt(couponfound.offer)
              resolve(response)
          }
          else {
              response.status = 2
              resolve(response)

          }

      }
      else {
          response.status = 1
          resolve(response)
      }

  })
},



getcategory1:(category1)=>{
  return new Promise(async(resolve,reject)=>{
    let products= await db.get().collection(collection.PRODUCT_COLLCTION).find({category:category1}).toArray()

    resolve(products)
  })
},






searchProduct: (keyword) => {

  return new Promise((resolve, reject) => {
      let result = db.get().collection(collection.PRODUCT_COLLCTION).find({bookname: { $regex: keyword, $options: '$i' } }).toArray()
      if (result[0]) {

          resolve(result)
        
      }
      else {
          result = db.get().collection(collection.PRODUCT_COLLCTION).find({ category: { $regex: keyword, $options: '$i' } }).toArray().then((result) => {

              if (result[0]) {
                  resolve(result)
                  
              }
              else {
                  result = db.get().collection(collection.PRODUCT_COLLCTION).find({authorname_fr: { $regex: keyword, $options: '$i' } }).toArray().then((result) => {
                      if (result[0]) {
                          resolve(result)
                        
                      }
                      else {
                          result = db.get().collection(collection.PRODUCT_COLLCTION).find({ description: { $regex: keyword, $options: "$i" } }).toArray().then((result) => {

                              if (result[0]) {
                                  resolve(result)
                                  
                              }
                              else {
                                  reject(result);
                                
                              }
                          })

                      }
                  })
              }
          })
      }


  })
},





editaddress: (proid, data) => {
  let Number=parseInt(data.number)
  return new Promise((resolve, reject) => {
    db.get()
      .collection(collection.ADRESS_COLLCTION)
      .updateOne(
        { _id: objectId(proid) },
        {
          $set: {details:{
            firstname: data.firstname,
            email: data.email,
            number: data.number,
            address:data.address,
            city:data.city,
            state:data.state,
            pincode:data.pincode
          }
          },
        }
      )
      .then((response) => {

        resolve();
      });
  });
},



getoneaddress:(Proid)=>{
  return new Promise(async(resolve,reject)=>{
   let address=await db.get().collection(collection.ADRESS_COLLCTION).findOne({_id:objectId(Proid)})
   resolve(address)
  })

},



changePassword: (data, userId) => {
  return new Promise(async (resolve, reject) => {
      let response = {}
      let user = await db.get().collection(collection.USER_COLLCTION).findOne({ _id: objectId(userId) })
      if (user) {
          
          
          bcrypt.compare(data.CurrentPassword, user.password).then(async(status) => {
              if (status) {
                  
                  data.NewPassword = await bcrypt.hash(data.NewPassword, 10)
                  db.get().collection(collection.USER_COLLCTION).updateOne({ _id: objectId(userId) }, {
                      $set: {
                          password: data.NewPassword
                      }
                  }).then((response) => {
                      response.success = true
                      resolve(response)
                  })

              }
              else {
                  response.failure = true
                  resolve(response)
              }

          })
      }
  })
},










}



