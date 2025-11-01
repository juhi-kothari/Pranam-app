import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import bookmarkReducer from "./bookmarkSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    bookmarks: bookmarkReducer,
  },
});

export default store;
