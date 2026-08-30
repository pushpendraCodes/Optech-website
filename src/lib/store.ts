import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import { studentAuthReducer } from "./studentAuthSlice";

export const store = configureStore({
  reducer: {
    studentAuth: studentAuthReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
