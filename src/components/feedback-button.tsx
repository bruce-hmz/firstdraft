'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MessageSquare, Loader2, Check, Send } from 'lucide-react'
import { analytics, getAnonymousId } from '@/lib/analytics'

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedback.trim(),
          email: email.trim() || undefined,
          anonymousId: getAnonymousId(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        analytics.feedbackSubmitted(feedback.trim().length)

        // Reset after delay
        setTimeout(() => {
          setIsOpen(false)
          setFeedback('')
          setEmail('')
          setIsSubmitted(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating feedback button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="Send feedback"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Feedback dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Send Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve FirstDraft. Share your thoughts, suggestions, or report issues.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="What's on your mind? Any feedback, suggestions, or issues..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-24 resize-none"
              disabled={isSubmitting || isSubmitted}
            />

            <Input
              type="email"
              placeholder="Email (optional, for follow-up)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || isSubmitted}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!feedback.trim() || isSubmitting || isSubmitted}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : isSubmitted ? (
                <>
                  <Check className="w-4 h-4" />
                  Sent!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
