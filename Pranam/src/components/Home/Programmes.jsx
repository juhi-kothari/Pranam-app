import React from "react";
import bg_image from "../../assets/Images/background.png";
import flower_img from '../../assets/Images/card_bg.png'

const programmes = [
  {
    id: 1,
    title: "Blossom for Bliss",
    description: `Feeling disturbed or disillusioned by the world? 
Anxious, stuck, stressed, zero focus, low motivation, heart-broken or depressed?

Let Pranam help you discover the 'Joy of Working on yourself' to come out of this cycle of hindrances that keep repeating themselves.`,
  },
  {
    id: 2,
    title: "Pranam Positivity",
    description: `A Whatsapp based short duration course 
Levels – 1,2,3

Each level works towards progressive dhyan, awareness and mindfulness.

The Uniqueness of this Programme:`,
  },
  {
    id: 3,
    title: "Pranam Daily Sessions of Collective Prayer",
    description: `Collective strength has great potential. When channelised, this force can be used to initiate mass transformation.

Pranam calls out to all to connect at 10 pm every night to pray for healing humanity and resurrecting true dharm.`,
  },
];

const Programmes = () => {
  return (
    <div className="w-full relative flex flex-col items-center py-12 px-4 bg-gradient-to-b from-[#FFFFFF] to-[#BCC57110] font-bricolage">
      <img
    src={bg_image}
    alt="flowers"
    className="absolute right-0 top-0 h-full object-contain"
    style={{ transform: "scaleX(-1)" }}

  />
      {/* Heading */}
      <h2 className="text-2xl md:text-4xl font-bold text-[#5B575F] mb-10">
        ONGOING PROGRAMMES
      </h2>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {programmes.map((prog) => (
          <div
            key={prog.id}
            className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col justify-between border border-gray-100"
            style={{
              backgroundImage:
                `url(${flower_img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                {prog.title}
              </h3>
              <p className="text-sm text-[#737373] font-semibold whitespace-pre-line text-center mt-4" style={{lineHeight : "100%" , letterSpacing : "-4"}}>
                {prog.description}
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <button className="px-12 py-2 rounded-2xl text-[#BCC571] bg-white  font-medium shadow-xl hover:opacity-90 transition mt-2">
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Programmes;
