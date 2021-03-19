var db = require("../conection/config");
var collection = require("../conection/conllection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectID;
const { response } = require("express");
const { PRODUCT_COLLCTION } = require("../conection/conllection");
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
        console.log("blocked 0000");
        response.status = 4;
        resolve(response);
      } else {
        if (user) {
          bcrypt.compare(userData.password, user.password).then((result) => {
            if (result) {
              response.user = user;
              response.status = 1;
              console.log("login success", response);
              resolve(response);
            } else {
              console.log("login failled111");
              response.status = 2;
              resolve(response);
            }
          });
        } else {
          console.log("login failed");
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
      console.log(Product);
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
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLCTION)
        .updateOne(
          { _id: objectId(proid) },
          {
            $set: {
              username: data.username,
              email: data.email,
              number: data.number,
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
      console.log(proId);
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
          console.log(productId);
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
          console.log(response);
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
          console.log(productId);
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
    console.log("cataegory ethi");

    return new Promise(async (resolve, reject) => {
      let data = 1;
      data = await db.get().collection(collection.CATEGORY).find().toArray();
      resolve(data);
      console.log(data);
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
              console.log("varunnundo", response);
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
              subtotal:{$multiply:[{$arrayElemAt:["$product.price",0]},"$quantity"]}
            },
          },
        ])
        .toArray();
      resolve(cartItems);
      console.log("resolve", cartItems);
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
            resolve({status:true});
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
    console.log(userId)
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART)
        .aggregate([
          {
            $match: { user: objectId(userId) }
          },
          {
            $unwind: "$products"
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity"
            }
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLCTION,
              localField: "item",
              foreignField: "_id",
              as: "product"
            }
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] }
            }
          },

          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } }
            }
          }
        ])
        .toArray();
      resolve(total[0].total)
    });
  },



subTotalAmount: (userId,proId) => {
  console.log(userId)
  return new Promise(async (resolve, reject) => {
    let total = await db
      .get()
      .collection(collection.CART)
      .aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: "$products"
        },
        {
          $project: {
            item: "$products.item",
            quantity: "$products.quantity"
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLCTION,
            localField: "item",
            foreignField: "_id",
            as: "product"
          }
        },
        // {
        //   $project: {
        //     item: 1,
        //     quantity: 1,
        //     product: { $arrayElemAt: ["$product", 0] }
        //   }
        // },
        {
          $match:{item:objectId(proId)}
        },

        {
          $project: {
            _id: null,
            total:  { $multiply:[{$arrayElemAt:["$product.price",0]},"$quantity"] }
          }
        }
      ])
      .toArray();
    resolve(total[0].total)
  });
}
};

