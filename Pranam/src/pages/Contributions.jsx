import React, { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import blog_one from "../assets/Images/blog_one.png"
import blog_two from "../assets/Images/blog_two.png"
import blog_three from "../assets/Images/blog_three.png"

const contributions = [
  {
    id: 1,
    title: "THE LANGUAGE OF SYMBOLS",
    date: "29-07-2012",
    author: "Meena Om",
    image: blog_one,
    description:
      "Recently I visited Kolkata after a hiatus of 6 years. Oh! Kolkata... How my heart pained seeing you. It seemed as if time has stopped in this city. Everything felt dull, stagnant, old and neglected.",
    article:
      "Recently I visited Kolkata after a hiatus of 6 years... (full article text here)"
  },
  {
    id: 2,
    title: "HOW TO LIVE IN DIVINE CONSCIOUSNESS?",
    date: "29-07-2012",
    author: "Meena Om",
    image: blog_two,
    description:
      "A Butterfly spreading its silvery wings full of magical colors fluttering and dancing on the sweet scented flowers is an unforgettable sight. It etched a deep image in my mind remembering which frequently brings joy. ",
    article: "A Butterfly spreading its silvery wings... (full article text here)"
  },
  {
    id: 3,
    title: "The Litmus Test of Love",
    date: "29-07-2012",
    author: "Meena Om",
    image: blog_two,
    description:
      "A Butterfly spreading its silvery wings full of magical colors fluttering and dancing on the sweet scented flowers is an unforgettable sight. It etched a deep image in my mind remembering which frequently brings joy. ",
    article: "In conversation with Meenaji…Seeker: What is the significance of the Eclipse in our lives? Meena ji: Solar Eclipse or any other eclipse is the accuracy of the rhythm of Nature. "
  },
];

const Contributions = () => {
  const [visibleCount, setVisibleCount] = useState(2);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDiscoverMore = () => {
    setVisibleCount((prev) => prev + 2);
  };

  return (
    <div>
      <NavBar />
      <div className="min-h-screen max-w-7xl mx-auto bg-white text-gray-800 px-4 md:px-8 py-24">
        <hr className="border-t border-black mb-6" />

          {/* Dropdown */}
          <div className="mb-1 ml-2">
            <select className="px-2 py-2 border border-gray-300 rounded-[14px] text-[14px] text-white bg-[#BCC571] font-semibold focus:outline-none focus:ring-2 focus:ring-black">
              <option value="meena">Meena Om</option>
              <option value="guest">Guest Authors</option>
            </select>
          </div>

          {/* Heading */}
          <h2 className="text-2xl xl:text-4xl font-semibold uppercase tracking-wide text-[#5B575F] pb-2 ml-2">
            Contributions by Meena Om
          </h2>

          <hr className="border-t border-black mt-6" />


        <div className="space-y-10 mt-8">
          {contributions.slice(0, visibleCount).map((item) => (
            <div key={item.id} className="pb-6">
              <h2 className="text-lg md:text-3xl font-semibold mb-2 text-[#00000099]">
                {item.title}
              </h2>
              <p className="text-sm text-gray-500 mb-3 text-end">
                {item.author} <br /> {item.date}
              </p>
              <div className="flex flex-col md:flex-row items-start gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="rounded-md shadow-md w-full md:w-[400px] h-[260px] object-cover"
                />
                <div className="flex flex-col justify-end w-full">
                  <p className="text-[#737373] text-[23px] font-semibold mb-3 mt-16" style={{lineHeight : "100%" , letterSpacing : "-4%"}}>{item.description}</p>
                  <Link
                    to={`/blog/${item.id}`}
                    state={{ item }}
                    className="bg-green-400 text-white text-sm px-4 py-2 rounded-full shadow hover:bg-green-500 transition self-end"
                  >
                    Read More
                  </Link>
                </div>
              </div>
              <hr className="border-t border-[#000000] mt-6" />
            </div>
          ))}
        </div>

        {visibleCount < contributions.length && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleDiscoverMore}
              className="bg-[#BCC571] text-white px-6 py-2 rounded-[14px] shadow transition"
            >
              Discover More
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Contributions;
