import { configureStore } from "@reduxjs/toolkit"
import { finalQuizApi } from "@/api/services/FinalQuiz"
import { educatorDashboardApi } from "@/api/services/EducatorDashboardStudentPerformanceSummary"
import { educatorDashboardStatsApi } from "@/api/services/EducatorDashboardOverallStats" 

export const store = configureStore({
  reducer: {
    [finalQuizApi.reducerPath]: finalQuizApi.reducer,
    [educatorDashboardApi.reducerPath]: educatorDashboardApi.reducer,
    [educatorDashboardStatsApi.reducerPath]: educatorDashboardStatsApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      finalQuizApi.middleware,
      educatorDashboardApi.middleware,
      educatorDashboardStatsApi.middleware
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
