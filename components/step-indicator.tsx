interface StepIndicatorProps {
  currentStep: number
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { num: 1, label: "Practice" },
    { num: 2, label: "UML Builder" },
    { num: 3, label: "Cheat Sheet" },
    { num: 4, label: "Quiz" },
    { num: 5, label: "Results" },
  ]

  return (
    <div className="flex justify-center items-center gap-8">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
              step.num <= currentStep ? "bg-teal-700 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            {step.num}
          </div>
          <div className="text-center">
            <p className={`font-bold ${step.num <= currentStep ? "text-teal-700" : "text-gray-400"}`}>{step.label}</p>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-8 h-1 ${step.num < currentStep ? "bg-teal-700" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  )
}
