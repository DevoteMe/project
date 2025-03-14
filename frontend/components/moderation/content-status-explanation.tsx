import type { ModerationStatus } from "@/types/moderation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, CheckCircle, XCircle, AlertTriangle, HelpCircle } from "lucide-react"

interface ContentStatusExplanationProps {
  status: ModerationStatus
  reason?: string
}

export function ContentStatusExplanation({ status, reason }: ContentStatusExplanationProps) {
  switch (status) {
    case "pending":
      return (
        <Alert variant="warning" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <Clock className="h-4 w-4" />
          <AlertTitle>Content Pending Review</AlertTitle>
          <AlertDescription>
            Your content is currently awaiting moderation. It will be automatically approved in 60 seconds if no action
            is taken by our moderators.
          </AlertDescription>
        </Alert>
      )
    case "approved":
      return (
        <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Content Approved</AlertTitle>
          <AlertDescription>Your content has been approved and is now visible to the community.</AlertDescription>
        </Alert>
      )
    case "denied":
      return (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Content Denied</AlertTitle>
          <AlertDescription>
            <p>Your content has been denied and is not visible to the community.</p>
            {reason && (
              <div className="mt-2 p-2 bg-red-100 rounded-md">
                <p className="font-medium">Reason:</p>
                <p>{reason}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )
    case "quarantined":
      return (
        <Alert variant="warning" className="bg-orange-50 text-orange-800 border-orange-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Content Under Additional Review</AlertTitle>
          <AlertDescription>
            <p>
              Your content requires additional review by our moderation team and is not currently visible to the
              community.
            </p>
            {reason && (
              <div className="mt-2 p-2 bg-orange-100 rounded-md">
                <p className="font-medium">Reason:</p>
                <p>{reason}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )
    default:
      return (
        <Alert variant="default">
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>Unknown Status</AlertTitle>
          <AlertDescription>The status of this content is unknown.</AlertDescription>
        </Alert>
      )
  }
}

