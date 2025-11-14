"use client"
import { logoutUser } from "@/lib/auth/logout";

interface StudentHeaderProps {
  userName: string
  // onLogout: () => void
}

export function StudentHeader({ userName }: StudentHeaderProps) {
  return (
    <header className="bg-teal-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Design Pattern Learning Platform</h1>
        
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-blue-100">Student</p>
          </div>
          <button
            onClick={logoutUser}
            className="px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
