import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeBookmark } from "../redux/bookmarkSlice";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Bookmarks = () => {
  const bookmarks = useSelector((state) => state.bookmarks);
  const dispatch = useDispatch();

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6">My Bookmarks</h1>

        {bookmarks.length === 0 ? (
          <p className=" h-screen text-xl text-gray-600">No bookmarks yet.</p>
        ) : (
          <div className="flex w-full">
            <div className="w-full flex flex-wrap gap-6">
              {bookmarks.map((book) => (
                <div
                  key={book.id}
                  className="relative bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl duration-300 hover:scale-105 transition-transform w-64"
                >
                  {/* Image */}
                  <Link to={`/publications/${book.id}`} state={{ book }}>
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full"
                    />
                  </Link>

                  {/* Details */}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold">{book.title}</h2>
                    <p className="text-sm text-gray-600">{book.subtitle}</p>
                    <p className="mt-2 font-bold">{book.price}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => dispatch(removeBookmark(book.id))}
                    className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 text-sm rounded-lg shadow hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Bookmarks;
