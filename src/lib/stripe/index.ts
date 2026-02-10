import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
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
