import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { increaseQty, decreaseQty, removeFromCart, clearCart } from "../redux/cartSlice";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
      }, []);

  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const total = items.reduce((sum, i) => sum + parseFloat(i.price.replace("₹","")) * i.quantity, 0);

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold ">Your Cart</h1>
        {items.length === 0 ? (
            <div className="flex flex-col justify-center items-center">
                <img src="https://imgs.search.brave.com/OBP10ipgJj7k96pZwKn_GusoEciuVJH-kXHROW1Jdlk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/ZHJpYmJibGUuY29t/L3VzZXJ1cGxvYWQv/MjI1ODI3MjgvZmls/ZS9vcmlnaW5hbC1k/NDYxNTY0NjU4NDc5/MWRiYmEzMWMzYzIz/ZTM3Y2E1Zi5wbmc_/Zm9ybWF0PXdlYnAm/cmVzaXplPTQwMHgz/MDAmdmVydGljYWw9/Y2VudGVy" alt="" />
                <p className="text-gray-600 font-bold text-xl mt-4">Your cart is empty.</p>
            </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center bg-white shadow-md rounded-xl p-4"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-32 object-cover rounded-lg"
                  />
                  <div className="ml-4 flex-1">
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="text-sm text-gray-500">{item.author}</p>
                    <p className="mt-2 font-medium">{item.price}</p>
                    <div className="flex items-center mt-3 space-x-3">
                      <button
                        onClick={() => dispatch(decreaseQty(item.id))}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => dispatch(increaseQty(item.id))}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="text-red-500 font-medium ml-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-[#EFF1DD] p-6 rounded-xl shadow-md h-[280px]">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Total Items:</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Price:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate("/payment", { state: { items, total } })}
                className="mt-6 w-full py-2 rounded-lg bg-[#BCC571] text-white font-medium"
              >
                Checkout
              </button>
              <button
                onClick={() => dispatch(clearCart())}
                className="mt-3 w-full py-2 rounded-lg bg-gray-300 text-black font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
