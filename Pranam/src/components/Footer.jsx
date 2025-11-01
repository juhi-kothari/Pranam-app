import React, { useState } from "react";
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaVimeoV } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Successfully subscribed to newsletter!");
        setMessageType("success");
        setEmail("");
      } else {
        setMessage(data.message || "Failed to subscribe to newsletter");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error. Please try again later.");
      setMessageType("error");
      console.error("Newsletter subscription error:", error);
    } finally {
      setLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-[#FFFFFF] to-[#BCC57140] text-center py-10 px-4 font-bricolage">
      {/* Heading */}
      <h2 className="text-2xl md:text-4xl font-bold text-[#BCC571] mb-4 uppercase">
        STAY UPDATED WITH  <br />newsletter
      </h2>
      <p className="text-black max-w-3xl mx-auto mb-8 text-[16px]" style={{lineHeight : "160%" , letterSpacing : "0%"}}>
        The Newsletter provides a synopsis of the current happenings at Pranam. This is a gentle <br /> reminder to stay connected with the Voice of Consciousness as working on the self should also <br /> be a goal in this fast paced life.
      </p>

      {/* Newsletter */}
      <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8">
        <input
          type="email"
          placeholder="Enter your email address for Newsletter"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="px-6 py-2 rounded-md border bg-[#F7EDFF00] border-[#BCC571] w-96 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-md bg-[#EFF1DD] border border-[#BCC571] text-black font-medium transition hover:bg-[#BCC571] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {/* Newsletter Message */}
      {message && (
        <div className={`mb-4 text-center text-sm font-medium ${
          messageType === "success" ? "text-green-600" : "text-red-600"
        }`}>
          {message}
        </div>
      )}

      {/* Social Icons (React Icons FA) */}
      <div className="flex justify-center gap-4 mb-8">
        <a
          href="#"
          className="w-10 h-10 flex items-center justify-center rounded-full shadow text-black"
        >
          <FaTwitter size={18} />
        </a>
        <a
          href="#"
          className="w-10 h-10 flex items-center justify-center rounded-full shadow text-black"
        >
          <FaFacebookF size={18} />
        </a>
        <a
          href="#"
          className="w-10 h-10 flex items-center justify-center rounded-full shadow text-black"
        >
          <FaLinkedinIn size={18} />
        </a>
        <a
          href="#"
          className="w-10 h-10 flex items-center justify-center rounded-full shadow text-black"
        >
          <FaVimeoV size={18} />
        </a>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-300 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        <p>Copyright ©pranam All Rights Reserved</p>
        <div className="flex gap-6 mt-2 md:mt-0">
          <a href="#" className="hover:underline">
            Terms & Conditions
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
