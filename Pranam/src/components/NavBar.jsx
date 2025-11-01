import React, { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    window.location.href = "/";
  };

  const baseMenuItems = [
    { name: "प्रणाम हिंदी", path: "/hindi" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Publication", path: "/publications" },
    { name: "Bookmarks", path: "/bookmarks" },
    { name: "Cart", path: "/cart", isCart: true },
  ];

  // Add auth-specific menu items
  const menuItems = auth.user
    ? [...baseMenuItems] // Authenticated users don't see Sign Up button
    : [...baseMenuItems, { name: "Sign Up", path: "/auth", isButton: true }];

  return (
    <header className="fixed top-0 left-0 w-full backdrop-blur-lg shadow-sm z-50 font-bricolage">
      <div className="flex justify-between items-center px-6 py-4 w-full mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="uppercase text-2xl lg:text-[40px] font-bold tracking-wide text-gray-900"
        >
          PRANAM
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex">
          <ul className="flex xl:space-x-12 space-x-8 font-semibold text-black xl:text-lg items-center">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`relative cursor-pointer transition flex items-center ${
                    item.isButton
                      ? "bg-[#BCC571] text-white px-3 py-2 rounded-xl hover:bg-[#a9b45d]"
                      : item.isCart
                      ? "" // ✅ no underline for cart image
                      : "after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[3px] after:bg-[#BCC571] after:transition-all after:duration-300 hover:after:w-full"
                  }`}
                >
                  {item.isCart ? (
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/833/833314.png"
                      alt="Cart"
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    item.name
                  )}
                </Link>
              </li>
            ))}

            {/* User Menu for Authenticated Users */}
            {auth.user && (
              <li className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-[#BCC571] text-white px-3 py-2 rounded-xl hover:bg-[#a9b45d] transition"
                >
                  <User size={18} />
                  <span>{auth.user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{auth.user.name}</div>
                      <div className="text-gray-500">{auth.user.email}</div>
                      {auth.user.role === 'admin' && (
                        <div className="text-[#BCC571] font-medium">Admin</div>
                      )}
                    </div>
                    {auth.user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <ul className="flex flex-col space-y-4 px-6 py-4 font-medium text-gray-800">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`block transition ${
                    item.isButton
                      ? "w-full bg-[#BCC571] text-white px-4 py-2 rounded-full text-center hover:bg-[#a9b45d]"
                      : "hover:text-[#BCC571]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.isCart ? (
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/833/833314.png"
                      alt="Cart"
                      className="w-6 h-6 object-contain mx-auto"
                    />
                  ) : (
                    item.name
                  )}
                </Link>
              </li>
            ))}

            {/* Mobile User Menu */}
            {auth.user && (
              <>
                <li className="border-t pt-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="font-medium">{auth.user.name}</div>
                    <div className="text-gray-500">{auth.user.email}</div>
                    {auth.user.role === 'admin' && (
                      <div className="text-[#BCC571] font-medium">Admin</div>
                    )}
                  </div>
                </li>
                {auth.user.role === 'admin' && (
                  <li>
                    <Link
                      to="/admin"
                      className="block hover:text-[#BCC571]"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left hover:text-[#BCC571] flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default NavBar;
