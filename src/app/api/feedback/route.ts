import { NextRequest, NextResponse } from 'next/server'

interface FeedbackRequest {
  feedback: string
  email?: string
  anonymousId?: string
  userAgent?: string
  url?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json()

    if (!body.feedback?.trim()) {
      return NextResponse.json(
        { success: false, error: { message: 'Feedback is required' } },
        { status: 400 }
      )
    }

    // Log feedback to console for now (validation phase)
    // In production, this could send to email, database, or a service
    console.log('\n========================================')
    console.log('📝 NEW FEEDBACK RECEIVED')
    console.log('========================================')
    console.log(`Timestamp: ${new Date().toISOString()}`)
    console.log(`Anonymous ID: ${body.anonymousId || 'N/A'}`)
    console.log(`Email: ${body.email || 'Not provided'}`)
    console.log(`URL: ${body.url || 'N/A'}`)
    console.log(`User Agent: ${body.userAgent || 'N/A'}`)
    console.log(`\nFeedback:\n${body.feedback.trim()}`)
    console.log('========================================\n')

    // TODO: For production, consider:
    // 1. Send to email via existing email service
    // 2. Store in database for later analysis
    // 3. Forward to Slack/Discord webhook
    // 4. Integrate with support ticket system

    return NextResponse.json({
      success: true,
      data: { message: 'Feedback received. Thank you!' },
    })
  } catch (error) {
    console.error('Failed to process feedback:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Failed to submit feedback' } },
      { status: 500 }
    )
  }
}
