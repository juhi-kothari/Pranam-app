import React, { useState } from "react";
import flower_img from '../../assets/Images/flowers.png'
import icon_bag from '../../assets/Icons/icon_bag.png'
const SeekerQuestions = () => {
  const [formData, setFormData] = useState({
    name: "",
    seekingFor: "",
    description: "",
    photo: "",
    email: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.seekingFor || !formData.description) {
      setMessage("Please fill in all required fields");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/forms/healing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Healing request submitted successfully! Our mentors will connect with you soon.");
        setMessageType("success");
        setFormData({
          name: "",
          seekingFor: "",
          description: "",
          photo: "",
          email: "",
          phone: ""
        });
      } else {
        setMessage(data.message || "Failed to submit healing request");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error. Please try again later.");
      setMessageType("error");
      console.error("Healing form submission error:", error);
    } finally {
      setLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    }
  };

  const conversations = [
    {
      title: "The Art of Mindful Living",
      msg: "Embracing mindfulness can transform our daily routines into profound experiences of presence and gratitude...",
      name: "Emma Li",
      time: "3 days ago",
    },
    {
      title: "Harnessing the Power of Nature",
      msg: "Nature has a unique ability to soothe the soul, offering a retreat from the chaos of urban life...",
      name: "James Thompson",
      time: "1 week ago",
    },
    {
      title: "The Journey of Self-Discovery",
      msg: "Exploring our inner selves can lead to unexpected revelations and a deeper understanding of our true purpose...",
      name: "Sophia Reynolds",
      time: "2 days ago",
    },
  ];

  return (
    <div className="min-h-screen w-full flex justify-center items-center font-bricolage bg-[#EFF1DD] relative">
      <img
        src={flower_img}
        alt="flowers"
        className="absolute left-0 top-0 h-full opacity-60"
        style={{ transform: "scaleX(1)" }}
      />

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 p-6 md:p-10">
        {/* Left Section */}
        <div>
          {/* Heading */}
          <h2 className="text-2xl md:text-[40px] font-semibold text-[#5B575F] uppercase tracking-wide mb-2" style={{lineHeight : "100%"}}>
            Seeking Guidance or Healing
          </h2>
          <p className="text-[#737373] text-[24px] font-semibold mb-6" style={{lineHeight : "100%" , letterSpacing : "-4%"}}>
            Feeling entangled or burdened with woes of life, Pranam
            bandhus-mentors can support and send you healing.
          </p>

          {/* Transparent Form Box */}
          <div className="rounded-2xl shadow-md border border-[#BCC571] p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Success/Error Message */}
              {message && (
                <div className={`text-center text-sm font-medium p-3 rounded-md ${
                  messageType === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}>
                  {message}
                </div>
              )}

              {/* Name & Seeking For */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block font-semibold text-[#000000] text-[16px] mb-4"
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Jai Chachra"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="w-full px-4 py-2 rounded-full border shadow-md focus:outline-none focus:ring-2 focus:ring-[#BCC571] bg-[#FFFFFFA6] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="seekingFor"
                    className="block font-semibold text-[#000000] text-[16px] mb-4"
                  >
                    Seeking For *
                  </label>
                  <input
                    type="text"
                    id="seekingFor"
                    placeholder="Relationship"
                    value={formData.seekingFor}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="w-full px-4 py-2 rounded-full shadow-md border focus:outline-none focus:ring-2 focus:ring-[#BCC571] bg-[#FFFFFFA6] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block font-semibold text-[#000000] text-[16px] mb-4"
                >
                  Short Description *
                </label>
                <textarea
                  id="description"
                  placeholder="This is confidential"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  className="w-full px-4 py-2 rounded-lg shadow-md border focus:outline-none focus:ring-2 focus:ring-[#BCC571] bg-[#FFFFFFA6] disabled:opacity-50"
                />
              </div>

              {/* Optional Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block font-semibold text-[#000000] text-[16px] mb-4"
                  >
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-full border shadow-md focus:outline-none focus:ring-2 focus:ring-[#BCC571] bg-[#FFFFFFA6] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block font-semibold text-[#000000] text-[16px] mb-4"
                  >
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-full border shadow-md focus:outline-none focus:ring-2 focus:ring-[#BCC571] bg-[#FFFFFFA6] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Attach Photo */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="photo"
                  className="block font-semibold text-[#000000] text-[16px] mb-4">
                  Attach Photo For Healing (optional)
                </label>
                <img
                  src={icon_bag}
                  alt="attach"
                  className="h-4 w-4 mr-12"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-16 py-2 text-[#BCC571] text-[18px] bg-[#FFFFFFA6] shadow-md font-semibold rounded-2xl hover:opacity-90 transition uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Receive Healing"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Section */}
        <div>
          {/* Heading */}
          <h2 className="text-2xl md:text-[40px] font-semibold text-[#5B575F] uppercase tracking-wide mb-6" style={{letterSpacing :'0%' , lineHeight : "100%"}}>
            Recent Conversations Between Seekers and Meena Om
          </h2>

          <div className="space-y-6">
            {conversations.map((c, i) => (
              <div
                key={i}
                className="rounded-2xl shadow-md border px-5 py-4  backdrop-blur-sm"
              >
                <h3 className="text-lg md:text-[26px] font-semibold text-[#000000]">
                  {c.title}
                </h3>
                <p className="text-[#737373] w-11/12 font-semibold mt-2 text-[16px]" style={{lineHeight : "100%" , letterSpacing : "-4%"}}>{c.msg}</p>
                <p className="text-sm text-gray-500 mt-3 text-right">
                  {c.name} <br /> {c.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeekerQuestions;
