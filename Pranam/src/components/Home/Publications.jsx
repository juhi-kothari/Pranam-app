import React from "react";
import pub_one from "../../assets/Images/books.jpg";
import pub_two from "../../assets/Images/light.jpg";
import pub_three from "../../assets/Images/karm.jpg";
import icon_one from '../../assets/Icons/icon_message.png'
import icon_two from '../../assets/Icons/icon_bag_two.png'

const publications = [
  {
    id: 1,
    title: "The Path of Truth",
    description:
      "A journey into the depths of spiritual awakening and self-discovery.",
    image: pub_one,
  },
  {
    id: 2,
    title: "Love & Light",
    description:
      "Understanding the universal language of love and divine illumination.",
    image: pub_two,
  },
  {
    id: 3,
    title: "Karm & Consciousness",
    description:
      "Exploring the eternal cycle of action and spiritual evolution.",
    image: pub_three,
  },
];

const Publications = () => {
  return (
    <div className="w-full flex flex-col items-center py-16 px-4 font-bricolage">
      {/* Header */}
      <h2 className="text-2xl md:text-[42px] font-semibold text-[#5B575F] mb-6 text-center">
        FEATURED PUBLICATIONS
      </h2>

      {/* Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-x-12 mb-10 w-full max-w-5xl justify-center">
        <button className="flex items-center gap-2 px-6 xl:px-24 py-2 rounded-xl text-black font-semibold shadow-xl text-lg sm:text-lg">
          <img src={icon_one} alt="Meena Om" className="w-3 h-3 mr-2" />
          Meena Om
        </button>
        <button className="flex items-center gap-2 px-6 xl:px-24 py-2 rounded-xl shadow-xl text-black font-semibold text-lg sm:text-lg">
          <img src={icon_two} alt="Guest" className="w-3 h-3 mr-2" />
          Guest
        </button>
      </div>

      <div className="space-y-6 w-full max-w-[1280px] px-4">
        {publications.map((pub) => (
          <div
            key={pub.id}
            className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-2xl shadow-md border border-[#BCC571] bg-gradient-to-r from-white via-[#EFF1DD80] to-[#EFF1DD40]"
          >
            {/* Image */}
            <img
              src={pub.image}
              alt={pub.title}
              className="w-24 h-24 md:w-20 md:h-20 rounded-lg object-cover"
            />

            {/* Text Content */}
            <div className="flex-1">
              <h3 className="lg:text-[42px] text-lg font-bold text-gray-800">
                {pub.title}
              </h3>
              <p className="text-[#737373] text-sm mt-2 font-semibold">{pub.description}</p>
            </div>

            {/* Button Section */}
            <div className="flex flex-col items-start md:items-end">
              <button className="px-4 py-3   rounded-[16px] w-[310px] bg-white text-black text-[18px] font-medium shadow-xl border">
                Your Question/Quest/comments
              </button>
              <p className="text-[18px] text-[#737373D9] mt-4 mr-12 font-semibold">
                Meena Om will responds
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Button */}
      <button className="mt-10 px-12 py-2 rounded-xl border border-[#BCC571] text-black font-semibold hover:bg-[#BCC57140] transition">
        View All Publications
      </button>
    </div>
  );
};

export default Publications;
