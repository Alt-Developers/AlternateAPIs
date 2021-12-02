const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const countSchema = new Schema({
  apiName: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
});

countSchema.method.addCount = function () {
  this.count += 1;
  return this.save();
};

// userSchema.methods.addToCart = function (product) {
//   const cartProductIndex = this.cart.items.findIndex((cp) => {
//     return cp.productId.toString() === product._id.toString();
//   });
//   let newQuantity = 1;
//   const updatedCartItems = [...this.cart.items];

//   if (cartProductIndex >= 0) {
//     newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//     updatedCartItems[cartProductIndex].quantity = newQuantity;
//   } else {
//     updatedCartItems.push({
//       productId: product._id,
//       quantity: newQuantity,
//     });
//   }
//   const updatedCart = {
//     items: updatedCartItems,
//   };
//   this.cart = updatedCart;
//   return this.save();
// };

module.exports = mongoose.model("Count", countSchema);
