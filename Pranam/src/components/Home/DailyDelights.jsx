import React, { useRef } from "react";
import cardOne from "../../assets/Images/card_one.png";
import cardTwo from "../../assets/Images/card_two.png";
import cardThree from "../../assets/Images/card_three.png";
import cardFour from "../../assets/Images/card_four.png";
import cardFive from "../../assets/Images/card_five.png";
import cardSix from "../../assets/Images/card_six.png";
import flower from "../../assets/Icons/deco_flower.png";

const DailyDelights = () => {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const card = sliderRef.current.querySelector("div > img")?.parentElement;
      if (card) {
        const cardWidth = card.offsetWidth + 24; // card width + gap (24px = gap-6)
        sliderRef.current.scrollBy({
          left: direction === "left" ? -cardWidth : cardWidth,
          behavior: "smooth",
        });
      }
    }
  };

  const cards = [
    cardOne,
    cardTwo,
    cardThree,
    cardFour,
    cardFive,
    cardSix,
  ];

  return (
    <div className="py-12 px-6 bg-white text-center max-w-7xl mx-auto font-bricolage">
      {/* Title */}
      <h2 className="text-2xl md:text-[42px] font-bold text-[#5B575F]">
        DAILY DELIGHTS
      </h2>
      <p className="text-[#737373] mt-4 max-w-6xl mx-auto font-medium text-[18px]">
        These messages are insightful calls of time to awaken, propel and guide
        towards a higher goal for living a fruitful life.
      </p>

      {/* Date Badge */}
      <div
        className="inline-block bg-[#BCC57196] px-6 py-2 rounded-lg mt-6 relative text-2xl"
        style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 500 }}
      >
        5 July 2025
        <img
          src={flower}
          alt=""
          className="absolute top-[12px] left-[-35px]"
        />
        <img
          src={flower}
          alt=""
          className="absolute top-0 right-[-20px] h-12"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      {/* Slider */}
      <div className="h-[1px] w-full bg-red-500 mt-10"></div>
      <div className="relative scrollbar-hide">
        <div
          ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide xl:gap-12 gap-8 px-6"
        >
          {cards.map((src, index) => (
            <div
              key={index}
              className="min-w-[220px] md:min-w-[220px] xl:min-w-[227px] flex justify-center mt-6 mb-6"
            >
              <img
                src={src}
                alt={`card-${index}`}
                className="w-full xl:h-[380px] h-[320px] object-fill rounded-2xl shadow-xl transform transition duration-300 hover:scale-110"
              />
            </div>
          ))}
        </div>
        <div className="h-[1px] w-full bg-red-500 mt-2"></div>

        {/* Controls */}
        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 flex items-center justify-center bg-[#BCC571] text-white rounded-lg transition"
          >
            ◀
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 flex items-center justify-center bg-[#BCC571] text-white rounded-lg transition"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyDelights;
