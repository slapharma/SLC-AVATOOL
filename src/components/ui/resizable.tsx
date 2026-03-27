import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

function ResizablePanelGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex h-full w-full", className)} {...props}>{children}</div>
}

function ResizablePanel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1", className)} {...props}>{children}</div>
}

function ResizableHandle({ withHandle, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { withHandle?: boolean }) {
  return (
    <div className={cn("relative flex w-px items-center justify-center bg-border", className)} {...props}>
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </div>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
