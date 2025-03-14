"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Smile, PaperclipIcon, Send, X, Image, FileText, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMessaging } from "@/providers/messaging-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"

type MessageComposerProps = {
  conversationId: string
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const { sendMessage, isMessageSending } = useMessaging()
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSend = async () => {
    if (message.trim() || attachments.length > 0) {
      await sendMessage(conversationId, message, attachments)
      setMessage("")
      setAttachments([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEmojiSelect = (emoji: any) => {
    setMessage((prev) => prev + emoji.native)
  }

  // Helper function to get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-4 w-4" />
    } else if (file.type.startsWith("video/")) {
      return <Film className="h-4 w-4" />
    } else {
      return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="p-4 border-t">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-1 bg-secondary/50 rounded p-1 pr-2 text-sm">
              {getFileIcon(file)}
              <span className="truncate max-w-[100px]">{file.name}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => removeAttachment(index)}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove attachment</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleAttachmentClick} type="button">
                  <PaperclipIcon className="h-5 w-5" />
                  <span className="sr-only">Add attachment</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add attachment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" type="button">
                      <Smile className="h-5 w-5" />
                      <span className="sr-only">Add emoji</span>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add emoji</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-auto p-0" align="start">
              <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
            </PopoverContent>
          </Popover>
        </div>

        <Textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[40px] max-h-[120px] resize-none flex-1"
          rows={1}
        />

        <Button
          size="icon"
          className="h-10 w-10"
          onClick={handleSend}
          disabled={isMessageSending || (!message.trim() && attachments.length === 0)}
          type="button"
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*,video/*,application/pdf,text/plain"
      />
    </div>
  )
}

