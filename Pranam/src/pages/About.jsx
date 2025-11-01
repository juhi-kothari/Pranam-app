import React from "react"; 
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
 import mam from '../assets/Images/mam.png'

const About = () => {
  return (
    <div>
        <NavBar></NavBar>
    <section className="max-w-7xl mx-auto px-6 py-28">
      {/* Heading */}
      <hr class="border-t border-black mb-8" />
      <h2 className="text-2xl xl:text-[64px] font-semibold uppercase tracking-wide text-[#5B575F] pb-2 ml-2">
        MEENA OM
      </h2>
      <hr class="border-t border-black mt-8" />


      {/* Top description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-[#737373] font-semibold p-6">
        <p className="text-lg xl:text-xl ">
          Born on 2nd October 1943 Meena Om is greatly <br /> influenced by Nature and her principles.
        </p>
        <p className="text-lg xl:text-xl">
          Her close association with Gandhiji and Meera Ben on a personal level during her early
          childhood also left an indelible mark on her.
        </p>
      </div>

      {/* Image */}
      <div className="mt-8">
        <img
          src={mam}
          alt="Meena Om"
          className="w-full rounded-[44px] shadow-md"
        />
      </div>

      {/* Bottom content */}
      <div className="mt-12 text-gray-700 leading-relaxed">
        <h3 className="text-2xl xl:text-[64px] font-bold text-[#737373] mb-2 inline-block">Meena Om</h3>
        <p className="inline text-[#737373] font-semibold text-[24px]" style={ { letterSpacing : "-4%"}}>
          with her vivacious visage and a 1000-watt smile is a spiritual mentor,
          master of sciences, healer, philosopher, Sufi mystic or perhaps just
          simply a ‘good’ human being. Nature is Meenaji’s inspiration, her
          mentor and her guide. She has merged with it to become a reflection of
          Mother Nature, her Daughter. Thus an obvious extension of all her
          wisdom was Pranam – a movement that is aspiring to prepare humankind
          for Global Oneness based on the true wisdom of Laws of Nature. Pranam
          means the expansion of one’s soul with humility. Pranam’s vision is to
          cultivate and motivate young minds to spread TRUTH, LOVE and LIGHT, by
          the spiritual realisation of the ever-evolving universal Consciousness,
          experiencing the joy of being a real human being, the perfect creation
          of Nature.
        </p>
      </div>
    </section>
    <Footer></Footer>
    </div>

  );
};

export default About;
