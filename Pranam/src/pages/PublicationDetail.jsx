import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import relatedProducts from "../data/relatedProducts";
import frame_one from "../assets/Images/frame_one.png";
import frame_two from "../assets/Images/frame_two.png";
import frame_three from "../assets/Images/frame_three.png";
import frame_four from "../assets/Images/frame_four.png";
import save from "../assets/Icons/save.png";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { addBookmark, removeBookmark } from "../redux/bookmarkSlice";

const PublicationDetail = () => {
    const bookmarks = useSelector((state) => state.bookmarks);
  
    const toggleBookmark = (book) => {
      if (bookmarks.find((b) => b.id === book.id)) {
        dispatch(removeBookmark(book.id));
      } else {
        dispatch(addBookmark(book));
      }
    };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const book = location.state?.book;

  const [showPopup, setShowPopup] = useState(false);

  const handleAddToCart = () => {
    dispatch(addToCart(book));
    setShowPopup(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!book) {
    return (
      <div>
        <NavBar />
        <div className="text-center py-20 text-xl">Book not found.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-10">
        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] sm:w-[400px] text-center relative">
              <h2 className="text-2xl font-bold text-green-700 mb-4">
                ✅ Item added to cart
              </h2>
              <p className="text-gray-700 mb-6">
                Your book has been successfully added to the cart.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 text-black hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="px-4 py-2 rounded-lg bg-[#BCC571] text-white hover:bg-[#a9b45d]"
                >
                  View Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top: Book image and details */}
        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={book.image || frame_one}
            alt={book.title}
            className="rounded-lg shadow-lg h-[550px] w-[400px] mb-2 md:mb-0"
          />
          <div className="flex flex-col">
            <h1 className="text-2xl xl:text-[64px] lg:text-[40px] font-bold mt-12">
              {book.title}
            </h1>
            <p className="text-[32px] font-semibold text-gray-900 mt-8">
              {book.price}
            </p>
            <p
              className="mt-3 text-[#28261B] font-semibold text-[20px]"
              style={{ lineHeight: "27px", letterSpacing: "0%" }}
            >
              {book.description ||
                "This book contains trans-writings of Pranam Meena Om, that have manifested through her intense dhyan. It reveals subtle wisdom of Nature and existence that assists in enhancing everyday life. Eternal Vedic knowledge is supported by hardcore contemporary scientific insights. A book apt for someone on the path of genuine spirituality."}
            </p>
            <div className="mt-6 space-y-1 text-[20px] text-black font-semibold ">
              <p>
                <span className="font-semibold">NO. OF PAGES:</span>{" "}
                {book.noOfPages || "N/A"}
              </p>
              <p>
                <span className="font-semibold">BINDING:</span> Section Sewn
              </p>
              <p>
                <span className="font-semibold">ISBN NO.:</span>{" "}
                {book.isbn || "N/A"}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              className="lg:mt-20 mt-12 py-2 w-[140px] rounded-[18px] bg-[#BCC571] text-white font-medium hover:bg-[#a9b45d] transition"
            >
              Add To Cart
            </button>
          </div>
        </div>

        {/* Center book images row */}
        <div className="bg-[#EFF1DD] rounded-lg py-8">
          <div className="flex flex-col md:flex-row justify-center md:space-x-6 py-4 ">
            <div className="flex flex-col gap-4 mb-4 md:mb-0">
              <img
                src={frame_two}
                alt="Frame Two"
                className="h-[200px] sm:h-[250px] md:h-[440px] w-[600px] rounded-lg shadow-md object-cover"
              />
              <img
                src={frame_four}
                alt="Frame Four"
                className="h-[120px] sm:h-[150px] md:h-[230px] w-[600px] rounded-lg object-cover mt-2"
              />
            </div>
            <img
              src={frame_three}
              alt="Frame Three"
              className="h-[300px] sm:h-[400px] md:h-[700px] w-[480] rounded-lg shadow-md object-cover"
            />
          </div>
        </div>

        {/* Category and weight bar */}
        <div>
          <div className="flex items-center justify-between bg-[#EFF1DD] px-5 py-3 rounded-tr-xl rounded-tl-xl mt-2">
            <div className="w-full mt-4">
              <p className="font-semibold lg:text-[36px] text-2xl text-[#00000099]">
                Category: {book.category || "Publication"}
              </p>
              <br />
              <p className="text-md text-black font-semibold text-end ">
                Weight: {book.weight || "0.35kg"}
              </p>
            </div>
          </div>
          <div className="bg-black h-[1.5px]"></div>
        </div>

        {/* Related Products grid */}
        <div>
          <h2 className="xl:text-4xl text-2xl font-bold mb-4">
            RELATED PRODUCTS
          </h2>
          <div className="flex flex-wrap gap-6 justify-center">
            {relatedProducts.map((related) => (
              <Link
                to={`/publications/${related.id}`}
                key={related.id}
                state={{ book: related }}
                className="w-full md:w-[40%] lg:w-[200px] xl:w-[270px]"
              >
                <div className="relative bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl duration-300 hover:scale-105 transition-transform">
                  {/* Book Image */}
                  <img
                    src={related.image}
                    alt={related.title}
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
                  <div
                    className="p-4"
                    style={{ backgroundColor: related.textcolor }}
                  >
                    <p className="text-sm mt-1 text-black font-medium xl:text-[16px] lg:text-[14px]">
                      This book will set you to think and help you to recognize
                      the God given attributes and the inner
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicationDetail;
