import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
    })
  }
  return stripeInstance
}

// Export a proxy that lazily initializes Stripe
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    const instance = getStripe()
    const value = instance[prop as keyof Stripe]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  }
})

export const STRIPE_PRICE_ID_PRO = process.env.STRIPE_PRICE_ID_PRO!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  })

  return customer.id
}
