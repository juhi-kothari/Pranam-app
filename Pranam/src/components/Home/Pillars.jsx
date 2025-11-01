import React from "react";
import pillarsData from "../../data/pillarsData";

const Pillars = () => {
  return (
    <section className="py-16 px-6 md:px-12 lg:px-20 bg-white font-bricolage">
      {/* Section Heading */}
      <div className="text-center max-w-5xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-bold text-[#5B575F]" style={{ lineHeight: "168%", letterSpacing: "0%" }}>
          THE FOUR PILLARS OF PRANAM
        </h2>
        <p className="mt-4 text-[#737373] text-sm sm:text-base md:text-lg leading-relaxed font-medium">
          These sacred principles form the foundation of our spiritual journey, propelling us towards growth and transformation to know your true self.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
        {pillarsData.map((pillar) => (
          <div
            key={pillar.id}
            className="flex flex-col bg-[#E5E8C799] rounded-tr-[80px] rounded-bl-[80px] rounded-tl-[20px] p-6 shadow-md hover:shadow-lg transition w-[268px] h-[284px]"
          >
            {/* Icon + Title */}
            <div className="flex items-center mb-4">
              <img
                src={pillar.icon}
                alt={pillar.title}
                style={{ width: pillar.width, height: pillar.height }}
              />
              <h3 className="text-lg sm:text-xl lg:text-3xl font-bold text-[#5B575F] ml-4">
                {pillar.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-[14px] text-[#737373] font-semibold leading-relaxed text-left ml-1 mb-4 sm:ml-2" style={ {letterSpacing : "-4%" , lineHeight : "100%"}}>
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pillars;
