-- Create payments table with product type support
CREATE TABLE public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  amount numeric not null,
  currency text not null default 'INR',
  product_type text not null,
  product_metadata jsonb,
  razorpay_order_id text not null,
  razorpay_payment_id text,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for performance
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_product_type ON payments(product_type);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_product_metadata ON payments USING GIN (product_metadata);

-- Add RLS policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own payments
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert payments
CREATE POLICY "Users can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow system to update payment status
CREATE POLICY "System can update payment status"
  ON public.payments FOR UPDATE
  USING (auth.uid() = user_id);
