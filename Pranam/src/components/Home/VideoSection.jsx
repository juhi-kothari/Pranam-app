import React, { useRef } from "react";
import videoSrc from "../../assets/video/pranam.mp4";

const VideoSection = () => {
  const videoRef = useRef(null);

  return (
    <section className=" mx-auto px-6 py-16 text-center font-bricolage">
      {/* Heading */}
      <h2 className="text-2xl md:text-[42px] font-semibold text-[#5B575F]">
        VOICE OF CONSCIOUSNESS
      </h2>
      <p className="mt-3 text-[#737373] text-sm md:text-[18px] max-w-5xl mx-auto font-medium">
        Satyam Shivum Sunderam… a consistent connection with The Divine flows
        through the words of Meena Om
      </p>

      {/* Video */}
      <div className="mt-8 flex justify-center">
        <div className="w-[1200px] h-[580px] rounded-3xl overflow-hidden shadow-lg">
          <video
            ref={videoRef}
            src={videoSrc}
            loop
            className="w-full h-full object-cover"
            onMouseEnter={() => videoRef.current.play()}
            onMouseLeave={() => videoRef.current.pause()}
          />
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
