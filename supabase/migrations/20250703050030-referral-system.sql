-- Add referral_code column to profiles table
ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN referred_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN referral_count INTEGER DEFAULT 0;

-- Create referrals table to track all referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_user_id)
);

-- Create function to generate referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    -- Generate 6 character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_already;
    
    -- If code doesn't exist, return it
    IF NOT exists_already THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle referral code validation and assignment
CREATE OR REPLACE FUNCTION validate_and_assign_referral_code(
  user_id UUID,
  referral_code_input TEXT
)
RETURNS JSON AS $$
DECLARE
  referrer_profile RECORD;
  result JSON;
BEGIN
  -- Convert input to uppercase
  referral_code_input := upper(referral_code_input);
  
  -- Check if user is trying to use their own code
  IF EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id AND referral_code = referral_code_input) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot use your own referral code! 🤦‍♂️'
    );
  END IF;
  
  -- Check if referral code exists
  SELECT * INTO referrer_profile FROM public.profiles WHERE referral_code = referral_code_input;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid referral code! Please try again with a valid one! 🎯'
    );
  END IF;
  
  -- Update the new user's profile with referrer information
  UPDATE public.profiles 
  SET referred_by = referrer_profile.id
  WHERE id = user_id;
  
  -- Increment referrer's referral count
  UPDATE public.profiles 
  SET referral_count = referral_count + 1
  WHERE id = referrer_profile.id;
  
  -- Insert into referrals table
  INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code)
  VALUES (referrer_profile.id, user_id, referral_code_input);
  
  RETURN json_build_object(
    'success', true,
    'message', 'Referral code applied successfully! Welcome aboard! 🚀',
    'referrer_name', referrer_profile.full_name
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to generate referral code for new users
CREATE OR REPLACE FUNCTION assign_referral_code_to_user(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate unique referral code
  new_code := generate_referral_code();
  
  -- Assign to user
  UPDATE public.profiles 
  SET referral_code = new_code
  WHERE id = user_id;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if a referral code exists (for real-time validation)
CREATE OR REPLACE FUNCTION check_referral_code_exists(
  referral_code_input TEXT
)
RETURNS JSON AS $$
DECLARE
  exists_code BOOLEAN;
BEGIN
  referral_code_input := upper(referral_code_input);
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = referral_code_input) INTO exists_code;
  RETURN json_build_object('exists', exists_code);
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to include referral code generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Generate referral code for new user
  PERFORM assign_referral_code_to_user(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they're involved in" ON public.referrals 
FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals" ON public.referrals 
FOR INSERT WITH CHECK (auth.uid() = referred_user_id);

-- Add indexes for better performance
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON public.referrals(referred_user_id); 