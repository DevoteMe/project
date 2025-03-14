import type { ReactNode } from "react"

interface EmptyProps {
  title: string
  description: string
  action?: ReactNode
}

export function Empty({ title, description, action }: EmptyProps) {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">{description}</p>
        {action}
      </div>
    </div>
  )
}

