import { configureStore } from "@reduxjs/toolkit"
import { finalQuizApi } from "@/api/services/FinalQuiz"
import { educatorDashboardApi } from "@/api/services/EducatorDashboardStudentPerformanceSummary"
import { educatorDashboardStatsApi } from "@/api/services/EducatorDashboardOverallStats" 
import { educatorOverviewApi } from "./services/EducatorOverviewStatsGraphs"

export const store = configureStore({
  reducer: {
    [finalQuizApi.reducerPath]: finalQuizApi.reducer,
    [educatorDashboardApi.reducerPath]: educatorDashboardApi.reducer,
    [educatorDashboardStatsApi.reducerPath]: educatorDashboardStatsApi.reducer,
    [educatorOverviewApi.reducerPath]: educatorOverviewApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      finalQuizApi.middleware,
      educatorDashboardApi.middleware,
      educatorDashboardStatsApi.middleware,
      educatorOverviewApi.middleware
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
