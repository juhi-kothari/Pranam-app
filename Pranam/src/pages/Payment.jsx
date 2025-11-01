import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { items, total } = state || { items: [], total: 0 };

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const handlePlaceOrder = () => {
    if (
      !address.trim() ||
      !city.trim() ||
      !pincode.trim() ||
      !stateName.trim() ||
      !country.trim() ||
      !phone.trim()
    ) {
      alert("Please fill all the address details and phone number.");
      return;
    }

    // Send data to backend
    console.log("Order placed:", {
      items,
      total,
      address,
      city,
      pincode,
      state: stateName,
      country,
      phone,
      paymentMethod,
    });

    alert("Order placed successfully!");
    navigate("/"); // redirect after order
  };

  return (
    <div>
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6">Payment</h1>

        {/* Address */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Street Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Enter your street address"
          />
        </div>

        {/* City, Pincode, State, Country, Phone */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-semibold mb-2">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Enter pincode"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">State</label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Enter state"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Enter country"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Payment Method</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              Online Payment
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-100 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-3">Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between mb-2">
              <span>
                {item.title} x {item.quantity}
              </span>
              <span>
                ₹{parseFloat(item.price.replace("₹", "")) * item.quantity}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg mt-3">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="w-full py-3 rounded-lg bg-[#BCC571] text-white font-semibold"
        >
          Place Order
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
