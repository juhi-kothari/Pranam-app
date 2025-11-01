import React, { useState } from "react";
import arrow from '../../assets/Icons/arrow-up.png'
import heart from '../../assets/Icons/heart.png'
import flower_img from '../../assets/Images/background.png'

const Questions = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    question: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  // Comment functionality
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentMessageType, setCommentMessageType] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Questions form submitted with data:", formData);

    if (!formData.name || !formData.category || !formData.question) {
      setMessage("Please fill in all required fields");
      setMessageType("error");
      console.log("Validation failed - missing required fields");
      return;
    }

    setLoading(true);
    setMessage("");
    console.log("Sending request to backend...");

    try {
      const response = await fetch("http://localhost:5000/api/forms/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response received:", response.status, response.statusText);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        setMessage("Question submitted successfully! Meena om will respond soon.");
        setMessageType("success");
        setFormData({
          name: "",
          email: "",
          category: "",
          question: ""
        });
      } else {
        setMessage(data.message || "Failed to submit question");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error. Please try again later.");
      setMessageType("error");
      console.error("Question submission error:", error);
    } finally {
      setLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setCommentMessage("Please enter a comment");
      setCommentMessageType("error");
      setTimeout(() => {
        setCommentMessage("");
        setCommentMessageType("");
      }, 3000);
      return;
    }

    setCommentLoading(true);
    setCommentMessage("");
    console.log("Submitting comment:", comment);

    try {
      const response = await fetch("http://localhost:5000/api/forms/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Anonymous",
          email: "",
          category: "Comment",
          question: comment
        }),
      });

      console.log("Comment response received:", response.status, response.statusText);
      const data = await response.json();
      console.log("Comment response data:", data);

      if (data.success) {
        setCommentMessage("Comment submitted successfully!");
        setCommentMessageType("success");
        setComment("");
      } else {
        setCommentMessage(data.message || "Failed to submit comment");
        setCommentMessageType("error");
      }
    } catch (error) {
      setCommentMessage("Network error. Please try again later.");
      setCommentMessageType("error");
      console.error("Comment submission error:", error);
    } finally {
      setCommentLoading(false);
      setTimeout(() => {
        setCommentMessage("");
        setCommentMessageType("");
      }, 5000);
    }
  };

  const conversations = [
    {
      name: "Joyce",
      msg: "What if this is just who I am now?",
      img: "https://randomuser.me/api/portraits/women/10.jpg",
    },
    {
      name: "vinirae",
      msg: "❤️❤️",
      img: "https://randomuser.me/api/portraits/women/20.jpg",
    },
    {
      name: "vania",
      msg: "🥺👍🏻👍🏻",
      img: "https://randomuser.me/api/portraits/women/30.jpg",
    },
    {
      name: "nia",
      msg: "Am I a burden to the people I love?",
      img: "https://randomuser.me/api/portraits/women/40.jpg",
    },
  ];

  return (
    <div className="min-h-screen w-full flex justify-center items-center  font-bricolage">
      <div
        className="w-full max-w-7xl p-6 md:p-10 relative bg-[#EFF1DD]">
          <img
            src={flower_img}
            alt="flowers"
            className="absolute left-0 top-0 h-full opacity-60"
            style={{ transform: "scaleX(1)" }}
          />
        {/* Centered Heading */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-[40px] font-semibold text-[#5B575F] uppercase tracking-[0px]">
            QUESTIONS/COMMENTS
          </h2>
          <p className="mt-6 text-[#737373] text-[24px] tracking-[-4%] font-semibold leading-[100%] ">- Meena om will respond.</p>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left Section - Form */}
          <div className="h-full flex flex-col relative">
            <div className="rounded-2xl shadow-lg p-6 md:p-8 h-full">
              <form onSubmit={handleSubmit} className="space-y-5 h-full flex flex-col">
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

                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block font-semibold text-[#000000] text-[16px] mb-4"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Inshra Fatma"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                      className="w-full px-4 py-2 rounded-full border shadow-md shadow-black/20 focus:outline-none focus:ring-2 focus:ring-[#BCC571] bg-[#FFFFFFA6] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-semibold text-[#000000] text-[16px] mb-4"
                    >
                      Email Id (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Inshrafatma@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-4 py-2 rounded-full border shadow-md shadow-black/20 focus:outline-none focus:ring-2 focus:ring-[#BCC571] bg-[#FFFFFFA6] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="block font-semibold text-[#000000] text-[16px] mb-4"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="w-full px-4 py-2 rounded-full border shadow-md shadow-black/20 focus:outline-none focus:ring-2 focus:ring-[#BCC571] bg-[#FFFFFFA6] disabled:opacity-50"
                  >
                    <option value="">Select a category</option>
                    <option value="General">General</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Relationship">Relationship</option>
                    <option value="Health">Health</option>
                    <option value="Career">Career</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Question */}
                <div className="flex-1">
                  <label
                    htmlFor="question"
                    className="block font-semibold text-[#000000] text-[16px] mb-4"
                  >
                    Your Question *
                  </label>
                  <textarea
                    id="question"
                    placeholder="Write here....."
                    rows="2"
                    value={formData.question}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="w-full px-6 py-4 rounded-[28px] border shadow-md shadow-black/20 focus:outline-none focus:ring-2 focus:ring-[#BCC571] h-full bg-[#FFFFFFA6] disabled:opacity-50"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={(e) => {
                      console.log("Submit button clicked!");
                      // Don't prevent default here, let the form handle it
                    }}
                    className="px-10 py-2 text-[#BCC571] bg-white shadow-xl font-medium rounded-2xl hover:opacity-90 transition mt-12 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Section - Conversations */}
          <div className="h-full flex flex-col">
            <div className="rounded-2xl shadow-lg p-6 md:p-8 backdrop-blur-md h-full flex flex-col">
              <div className="flex-1">
                {conversations.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 mb-5">
                    <img
                      src={c.img}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{c.name}</p>
                      <p className="text-[#000000AB]  text-[13px] italic">{c.msg}</p>
                    </div>
                  </div>
                ))}

                {/* Comment Message */}
                {commentMessage && (
                  <div className={`text-center text-sm font-medium p-2 rounded-md mb-3 ${
                    commentMessageType === "success"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}>
                    {commentMessage}
                  </div>
                )}

                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="flex gap-3">
                  <div className="flex justify-between px-4 py-2 rounded-[14px] w-7/12 bg-white border shadow-sm focus-within:ring-2 focus-within:ring-[#BCC571]">
                    <input
                      type="text"
                      placeholder="Comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={commentLoading}
                      className="flex-1 outline-none disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={commentLoading || !comment.trim()}
                      className="disabled:opacity-50"
                    >
                      <img src={arrow} alt="Submit comment" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setComment("❤️");
                      // Auto-submit heart
                      setTimeout(() => {
                        if (!commentLoading) {
                          handleCommentSubmit({ preventDefault: () => {} });
                        }
                      }, 100);
                    }}
                    disabled={commentLoading}
                    className="px-1 py-1 rounded-[10px] bg-white shadow hover:opacity-80 disabled:opacity-50"
                  >
                    <img src={heart} height={42} width={40} alt="Send heart" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questions;
