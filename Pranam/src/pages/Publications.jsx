import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { addBookmark, removeBookmark } from "../redux/bookmarkSlice";

// Import images properly
import book1 from "../assets/Images/Pub/pub_five.png";
import book2 from "../assets/Images/Pub/pub_six.png";
import book3 from "../assets/Images/Pub/pub_seven.png";
import book4 from "../assets/Images/Pub/pub_eight.png";
import book5 from "../assets/Images/Pub/pub_five.png";
import pubOne from "../assets/Images/Pub/pub_one.png";
import pubTwo from "../assets/Images/Pub/pub_two.png";
import pubThree from "../assets/Images/Pub/pub_three.png";
import pubFour from "../assets/Images/Pub/pub_four.png";
import save from "../assets/Icons/save.png";

const books = [
  {
    id: 1,
    title: "बिन्दु-बिन्दु विचार",
    subtitle: "आत्मज्ञान और जीवन",
    author: "Dr. Shalini",
    price: "₹180.00",
    image: book1,
    textcolor:"#8DC4E1"
  },
  {
    id: 2,
    title: "Timeless Bliss Divine",
    subtitle: "Calendar",
    author: "Nitya Publications",
    price: "₹150.00",
    image: book2,
    textcolor:"#EECC88"
  },
  {
    id: 3,
    title: "Symphony of Words",
    subtitle: "Poetry Collection",
    author: "Anuj Sharma",
    price: "₹200.00",
    image: book3,
    textcolor:"#E0DCC7"
  },
  {
    id: 4,
    title: "आत्म-काव्य",
    subtitle: "कविता संग्रह",
    author: "Ravi Kumar",
    price: "₹170.00",
    image: book4,
    textcolor:"#ABAAD0"
  },
  {
    id: 5,
    title: "बिन्दु-बिन्दु विचार",
    subtitle: "आत्मज्ञान और जीवन",
    author: "Dr. Shalini",
    price: "₹180.00",
    image: book1,
    textcolor : "#E0DCC7"
  },
  {
    id: 6,
    title: "Timeless Bliss Divine",
    subtitle: "Calendar",
    author: "Nitya Publications",
    price: "₹150.00",
    image: book2,
    textcolor:"#ABAAD0"
  },
  {
    id: 7,
    title: "Symphony of Words",
    subtitle: "Poetry Collection",
    author: "Anuj Sharma",
    price: "₹200.00",
    image: book3,
    textcolor:"#E0DCC7"
  },
  {
    id: 8,
    title: "आत्म-काव्य",
    subtitle: "कविता संग्रह",
    author: "Ravi Kumar",
    price: "₹170.00",
    image: book4,
    textcolor:"#EECC88"
  },
  {
    id: 9,
    title: "बिन्दु-बिन्दु विचार",
    subtitle: "आत्मज्ञान और जीवन",
    author: "Dr. Shalini",
    price: "₹180.00",
    image: book1,
    textcolor:"#E0DCC7"
  },
  {
    id: 10,
    title: "Timeless Bliss Divine",
    subtitle: "Calendar",
    author: "Nitya Publications",
    price: "₹150.00",
    image: book2,
    textcolor:"#ABAAD0"
  },
  {
    id: 11,
    title: "Symphony of Words",
    subtitle: "Poetry Collection",
    author: "Anuj Sharma",
    price: "₹200.00",
    image: book3,
    textcolor:"#8DC4E1"
  },
  {
    id: 12,
    title: "आत्म-काव्य",
    subtitle: "कविता संग्रह",
    author: "Ravi Kumar",
    price: "₹170.00",
    image: book4,
    textcolor:"#EECC88"
  },
];

const Publications = () => {
  const dispatch = useDispatch();
  const bookmarks = useSelector((state) => state.bookmarks);

  const toggleBookmark = (book) => {
    if (bookmarks.find((b) => b.id === book.id)) {
      dispatch(removeBookmark(book.id));
    } else {
      dispatch(addBookmark(book));
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <NavBar />
      <div className="min-h-screen max-w-7xl mx-auto py-20 px-6 md:px-8 space-y-10">
        {/* -------- First Row Hardcoded -------- */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 p-4 col-span-3">
            <img
              src={pubOne}
              alt="Anaadi Satya"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute bottom-5 w-11/12 flex justify-between items-center rounded-lg px-4 py-2 bg-[#FFFFFF14] backdrop-blur-sm text-black text-sm">
              <div>
                <p className="font-medium">Anaadi Satya</p>
                <p className="text-xs">₹350.00</p>
              </div>
              <span className="text-xs bg-white text-black px-2 py-0.5 rounded-md">
                2.5k Reads
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-4 col-span-2">
            <img
              src={pubTwo}
              alt="Growth Glory Grace"
              className="w-full object-cover rounded-lg"
            />
            <div className="p-4">
              <h2 className="text-[12px] text-[#737373] font-semibold uppercase">Growth Glory and Grace</h2>
              <p className="text-[16px] text-[#737373]">
                This book will set you to think and help you to <br /> recognize the
                God given attributes and the inner
              </p>
              <p className="text-sm font-medium text-[#737373] mt-2">₹250.00</p>
            </div>
          </div>
        </div>

        {/* Second Row Hardcoded */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Card 1 */}
  <div className="relative bg-white rounded-xl overflow-hidden shadow-md">
    <img
      src={pubThree}
      alt="NITYA GEETA"
      className="w-full h-64 object-cover rounded-xl"
    />
    {/* Overlay */}
    <div className="absolute bottom-0 left-0 right-0 p-4  text-white rounded-b-xl ">
      <p className="text-xs font-semibold uppercase">BINDU BINDU VICHAR</p>
      <h3 className="text-[16px] font-medium mt-1">
        This Book Will Set You To Think And Help You To <br /> Recognize The God Given Attributes And The Inner
      </h3>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm font-semibold">₹250.00</span>
        <span className="backdrop-blur-md bg-white/40 px-2 py-1 rounded-md text-white text-xs">2.5k Reads</span>
      </div>
    </div>
  </div>

  {/* Card 2 */}
  <div className="relative bg-white rounded-xl overflow-hidden shadow-md">
    <img
      src={pubFour}
      alt="Growth Glory Grace"
      className="w-full h-64 object-cover rounded-xl"
    />
    {/* Overlay */}
     <div className="absolute bottom-5 w-[97%] ml-2 flex justify-between items-center rounded-lg px-4 py-2 bg-[#FFFFFF14] backdrop-blur-sm text-black text-sm">
        <div>
            <p className="font-medium uppercase text-[12px]">Discover this</p>
            <p className="font-medium text-[16px]">Towards Life Divine – Calendar</p>
            <p className="text-[12px]">Calendar + Recyclable Cotton Potli</p>
        </div>
        <span className="text-xs bg-white text-black px-2 py-1 rounded-md">
          2.5k Reads
        </span>
       </div>
  </div>
</div>


        {/* -------- Dynamic Books -------- */}
        <div className="flex flex-wrap gap-6 justify-center">
  {books.map((book) => (
    <Link
      to={`/publications/${book.id}`}
      key={book.id}
      state={{ book }}
      className="w-full  md:w-[40%] lg:w-[200px] xl:w-[270px]"
    >
      <div className="relative bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl duration-300 hover:scale-105 transition-transform">
        {/* Book Image */}
        <img
          src={book.image}
          alt={book.title}
          className="w-full object-cover"
        />

        {/* Bookmark Icon */}
       <button
          onClick={(e) => {
            e.preventDefault(); 
            toggleBookmark(book);
          }}
          className="absolute xl:bottom-[125px] lg:bottom-[125px] bottom-[100px] right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
        >
          <img src={save} alt="Save" />
        </button>


        {/* Description */}
        <div className="p-4" style={{ backgroundColor: book.textcolor }}>
          <p className="text-sm mt-1 text-black font-medium xl:text-[16px] lg:text-[14px]">
            This book will set you to think and help you to recognize the God given attributes and the inner
          </p>
        </div>
      </div>
    </Link>
  ))}
</div>

      </div>
      <Footer />
    </div>
  );
};

export default Publications;
