import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2Icon
        role="status"
        aria-label="Loading"
        className={cn(
          "h-10 w-10 animate-spin text-muted-foreground",
          className
        )}
        {...props}
      />
    </div>
  );
}

export { Spinner };
