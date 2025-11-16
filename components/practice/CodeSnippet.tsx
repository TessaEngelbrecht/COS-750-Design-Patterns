import { Card } from "@/components/ui/card"

interface CodeSnippetProps {
  code: string
}

export function CodeSnippet({ code }: CodeSnippetProps) {
  return (
    <Card className="bg-slate-900 text-white p-4 font-mono text-sm mb-4 overflow-x-auto rounded-lg">
      <pre className="whitespace-pre-wrap">
        {code
          .replace(/\\\\n/g, '\n')
          .replace(/\\n/g, '\n')
          .replace(/\\\\/g, '')}
      </pre>
    </Card>
  )
}
