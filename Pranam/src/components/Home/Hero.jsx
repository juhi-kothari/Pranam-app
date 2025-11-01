import React from "react";
import { BookOpen, Compass } from "lucide-react";
import pranamImg from "../../assets/Images/Pranam_mam.png";
import pranamLogo from "../../assets/Images/pranam_logo.png";

const Hero = () => {
  return (
    <section className="relative bg-white py-16 px-6 md:px-6 xl:px-8 font-bricolage">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
        
        {/* Left Section */}
        <div>
          <img src={pranamLogo} alt="Pranam Logo" className="w-[270px] mb-4 lg:ml-24 " />
          <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#BCC571] mt-2 uppercase font-bricolage" style={{ lineHeight: "100%" , letterSpacing: "0%" }}>
            Welcome to Pranam
          </h1>
          <div className="mt-2 text-[#5B575F]   w-full mr-24 leading-relaxed bg-gradient-to-b from-[#EFF1DD] to-[#EFF1DD00] py-6 font-semibold ">
            <p className="w-[468px] text-[23px]" style={{ letterSpacing: "-4%" , lineHeight: "100%" }}>
            Pranam is a movement based on Truth <br />Love Karm and Light for spiritual <br /> blossoming, towards <br />
            a new dawn of humanity. Where <br /> transformation at the spiritual social <br /> political and economic <br />
            spheres is guided by the eternal truth of <br /> Laws of Nature.
          </p>
          </div>
          <button className="mt-8 flex items-center gap-2 text-black border font-medium px-6 py-3 rounded-xl shadow-lg bg-gradient-to-l from-[#EFF1DD] to-[#EFF1DD00]">
            Explore Pranam <Compass size={18} />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex flex-col md:flex-col lg:flex-row justify-center items-center mt-10">
          {/* Image */}
          <img
            style={{ boxShadow: "0 60px 40px -10px #EFF1DD" }}
            src={pranamImg}
            alt="Pranam"
            className="rounded-3xl w-[260px] sm:w-[320px] md:w-[300px] xl:w-[400px]"
          />


          {/* Info Card */}
         <div className="flex flex-col bg-gradient-to-b from-[#EFF1DD] to-[#EFF1DD00]  py-4 px-8 text-center lg:text-left mt-12 rounded-tr-[42px] xl:mr-20 xl:mt-40 lg:mt-40 lg:mr-24">
            <h2 className="text-xl md:text-2xl font-medium text-[#00000099]">
              PRANAM SPEAKS
            </h2>
            <p className="mt-3 text-[#5B575F] text-sm md:text-[20px] font-semibold  w-[260px]" style={{ lineHeight: "125%" , letterSpacing: "4%" }}>
              Captured in the writings <br /> of Meena Om is the <br /> essence of ever <br /> evolving
              and changing times.
            </p>
            <button className="mt-16 flex items-center justify-center lg:justify-center gap-2 text-black font-medium px-5 py-2.5 rounded-2xl shadow-xl bg-gradient-to-l  from-[#EFF1DD] to-[#EFF1DD00]">
              <BookOpen size={18} /> Start Reading
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
