import { useState, useEffect, ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Monitor } from "lucide-react"

function ScreenSizeChecker({ children }: { children: ReactNode }) {
  const [isValidSize, setIsValidSize] = useState(true)

  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isLandscapeTablet = width >= 768 && width > height
      const isDesktop = width >= 1024
      
      setIsValidSize(isDesktop || isLandscapeTablet)
    }

    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  if (!isValidSize) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="max-w-md p-8 text-center shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
              <Monitor className="w-10 h-10 text-teal-700" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-teal-700 mb-4">
            Desktop or Tablet Required
          </h2>
          <p className="text-gray-600 mb-6">
            A larger screen is required for the best experience. 
            Please switch to:
          </p>
          <div className="space-y-3 text-left bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-700 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                OK
              </div>
              <div>
                <p className="font-semibold text-gray-800">Desktop Computer</p>
                <p className="text-sm text-gray-600">Any desktop or laptop</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-700 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                OK
              </div>
              <div>
                <p className="font-semibold text-gray-800">Tablet in Landscape</p>
                <p className="text-sm text-gray-600">Rotate your tablet horizontally</p>
              </div>
            </div>
          </div>
          {/* <p className="text-sm text-gray-500 italic">
            Current screen is too small for the interactive UML diagram editor
          </p> */}
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

export { ScreenSizeChecker }
