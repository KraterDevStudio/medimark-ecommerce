# Supabase Setup Instructions

## Prerequisites
- Supabase account (sign up at https://supabase.com)
- Supabase project created

## Step 1: Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - Name: medimark-ecommerce (or your preferred name)
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
4. Wait for project to be provisioned (~2 minutes)

## Step 2: Get Your API Keys
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

## Step 3: Configure Environment Variables
Create a `.env` file in the project root with:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**Important:** Add `.env` to your `.gitignore` to keep keys secret!

## Step 4: Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run** or press `Ctrl+Enter`
5. Verify success (should see "Success. No rows returned")

## Step 5: Seed Initial Data
1. In SQL Editor, create another **New Query**
2. Copy and paste the entire contents of `supabase/seed.sql`
3. Click **Run**
4. Verify data was inserted (check the verification queries at the bottom)

## Step 6: Verify Tables
1. Go to **Table Editor** in Supabase dashboard
2. You should see 4 tables:
   - `products` (7 rows)
   - `user_profiles` (10 rows)
   - `orders` (1 row)
   - `order_items` (3 rows)

## Step 7: Test Row Level Security
1. Go to **Authentication** → **Policies**
2. Verify policies are enabled for all tables
3. Test public access to products:
   - Go to **Table Editor** → **products**
   - You should be able to view products

## Step 8: Restart Your Dev Server
```bash
npm run dev
```

The application should now be using Supabase!

## Troubleshooting

### Error: "Failed to fetch products"
- Check that `SUPABASE_URL` and `SUPABASE_KEY` are set correctly in `.env`
- Verify the schema was created successfully
- Check Supabase dashboard → **Logs** for errors

### Error: "Failed to create product" (Admin)
- Verify `SUPABASE_SERVICE_KEY` is set correctly
- Check that RLS policies allow service role to insert

### Error: "Unauthorized" when viewing orders
- Make sure you're logged in
- Check that the user exists in `user_profiles` table
- Verify RLS policies on orders table

### Products not showing on homepage
- Check browser console for errors
- Verify products exist in Supabase Table Editor
- Check network tab to see if API call is successful

## Migration Checklist
- [ ] Created Supabase project
- [ ] Copied API keys to `.env`
- [ ] Ran `schema.sql` successfully
- [ ] Ran `seed.sql` successfully
- [ ] Verified tables in Table Editor
- [ ] Restarted dev server
- [ ] Tested homepage (products load)
- [ ] Tested admin (can create/edit/delete products)
- [ ] Tested checkout (can place orders)
- [ ] Tested order history (can view past orders)
