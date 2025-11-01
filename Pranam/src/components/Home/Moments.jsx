import React from "react";
import { FaHeart, FaPlay } from "react-icons/fa";
import heart from "../../assets/Icons/solar_heart-bold.svg";
import heart_bold from "../../assets/Icons/solar_heart-bold.png";
import button from '../../assets/Icons/Button.png'
import moment_one from '../../assets/Images/momets_one.jpg'
import moment_two from '../../assets/Images/moment_two.jpg'

const moments = [
  {
    id: 1,
    image: moment_one,
    platform: "Instagram",
    i: heart_bold
  },
  {
    id: 2,
    image: moment_two,
    platform: "Instagram",
    i: heart
  },
];

const Moments = () => {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 py-12 px-6 font-bricolage">
      {/* Left - Reels Cards */}
      <div className="flex gap-12 overflow-x-auto md:overflow-visible pb-4 md:pb-0 relative">
        {moments.map((moment) => (
          <div
            key={moment.id}
            className="relative w-[300px] h-[500px] md:w-44 md:h-80 lg:w-56 lg:h-96 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
            style={{
              backgroundImage: `url(${moment.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                <FaPlay className="text-[#364468]" />
              </button>
            </div>

            {/* Footer bar */}
            <div className="absolute bottom-2 left-2 right-2 text-xs flex items-center justify-between gap-x-1">
              <div className="bg-[#FFFFFF66] text-white w-full rounded-[14px] px-4 py-2">
                <span>{moment.platform}</span>
              </div>
              <div className="rounded-[14px] bg-[#FFFFFF66] text-white px-3 py-2">
                <img src={moment.i} alt=""/>
              </div>
            </div>
          </div>
        ))}

        {/* Next button (hidden on small, visible on md+) */}
        <button className="hidden md:flex w-14 h-14 bg-black absolute right-[-25px] text-white rounded-full items-center justify-center self-center shadow-md">
         <img src={button} width={28} height={28} ></img>
        </button>
      </div>

      {/* Right - Testimonial */}
      <div className="flex flex-col text-left ml-8">
        <h2 className="text-lg md:text-[32px] font-semibold text-[#5B575F] mb-4 tracking-wide"style={{letterSpacing : "0%", lineHeight: "100%" }} >
          SOME 'AHA' MOMENTS OF <br /> PRANAM BANDHUS –
        </h2>
        <p className="text-[#737373] mb-2 text-[16px] md:text-lg font-semibold" style={{letterSpacing : "-4%", lineHeight : "100%"}}>
          Your association with Pranam, makes you a co-traveler or bandhu. <br />
          Share your revelations and experiences to inspire others on the <br />
          journey of self-discovery and self-love.
        </p>


        {/* Hindi text */}
        <p className="text-[#727EA7] mb-4 max-w-lg leading-relaxed text-sm md:text-[15px] mt-12" style={{letterSpacing : "0%" , lineHeight : "24px"}}>
          जब से सृष्टि बनी तब से सब याद रहना समझ लेना सारे रहस्य सारा सत्य ज्ञान यह <br /> मनुस्मृति है। गीता में श्रीकृष्ण ने यह सत्य स्वीकारा है कि सारे तथ्य सत्य को सबसे <br /> पहले मनु प्रथम मानव ने अपने पिता सूर्य से जाना- सत्य ऊर्जा स्रोत से। बाद में यह  <br />ज्ञान-रहस्य ऋषियों ने जाना पर धीरे-धीरे यह ज्ञान लुप्त हो गया। अर्जुन को यह ज्ञान <br />श्रीकृष्ण ने गीता बता बताकर दिया। ना जाने
        </p>

        <p className="font-semibold text-end text-[#6D758F]">Sinha Kumari</p>
      </div>
    </div>
  );
};

export default Moments;
