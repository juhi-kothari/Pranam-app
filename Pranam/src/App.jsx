import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";

import { AuthProvider } from "./context/AuthContext"; // ⬅️ import AuthProvider
import ChatWidget from "./components/Chat/ChatWidget"; // ⬅️ import ChatWidget

import Home from "./pages/Home";
import About from "./pages/About";
import Publications from "./pages/Publications";
import PublicationDetail from "./pages/PublicationDetail";
import Contributions from "./pages/Contributions";
import BlogDetail from "./pages/BlogDetail";
import Cart from "./pages/Cart";
import Bookmarks from "./pages/Bookmarks";
import SignUp from "./pages/AuthPage";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>   {/* ⬅️ Wrap everything inside AuthProvider */}
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<SignUp />} />
            <Route path="/about" element={<About />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/publications/:id" element={<PublicationDetail />} />
            <Route path="/blog" element={<Contributions />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <ChatWidget /> {/* ⬅️ Add ChatWidget globally */}
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
