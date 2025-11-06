import { configureStore } from "@reduxjs/toolkit";
import { finalQuizApi } from "@/api/services/FinalQuiz";

export const store = configureStore({
  reducer: {
    [finalQuizApi.reducerPath]: finalQuizApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(finalQuizApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
