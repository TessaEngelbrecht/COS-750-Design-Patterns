import { Button } from "@/components/ui/button"
import { CLASS_OPTIONS, CLASS_HELP } from "./constants"

interface ClassSelectorProps {
  selectedClass: string | null
  onAddClass: (name: string, type: string) => void
  onShowHelp: (title: string, content: string) => void
}

export function ClassSelector({ selectedClass, onAddClass, onShowHelp }: ClassSelectorProps) {
  return (
    <div className="space-y-2 mb-4">
      {CLASS_OPTIONS.map((cls, index) => (
        <div key={`${cls.name}-${index}`}>
          <button
            onClick={() => onAddClass(cls.name, cls.type)}
            className={`w-full py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
              selectedClass === cls.name 
                ? "bg-white text-teal-700 shadow-lg ring-2 ring-teal-400" 
                : "bg-teal-600 text-white hover:bg-teal-500"
            }`}
          >
            <div className="font-bold">{cls.name}</div>
            <div className="text-xs opacity-75">click to add</div>
          </button>
          {selectedClass === cls.name && (
            <Button
              onClick={() => onShowHelp(
                `About ${cls.name}`,
                CLASS_HELP[cls.name as keyof typeof CLASS_HELP]
              )}
              className="w-full mt-1 py-1 text-xs bg-cyan-400 text-teal-700 hover:bg-cyan-300"
            >
              Learn More
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
