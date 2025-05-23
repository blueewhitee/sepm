-- Create a trigger to update users.verified when verification requests are approved
CREATE OR REPLACE FUNCTION public.update_user_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If a verification request is being approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    -- Update the user's verified status to TRUE
    UPDATE public.users
    SET verified = TRUE
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove any existing triggers (this avoids errors if you run the script multiple times)
DROP TRIGGER IF EXISTS update_user_verification_on_approval ON public.verification_requests;
DROP TRIGGER IF EXISTS update_user_verification_on_insert_approval ON public.verification_requests;

-- Create the triggers
CREATE TRIGGER update_user_verification_on_approval
AFTER UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_user_verification_status();

CREATE TRIGGER update_user_verification_on_insert_approval
AFTER INSERT ON public.verification_requests
FOR EACH ROW
WHEN (NEW.status = 'approved')
EXECUTE FUNCTION public.update_user_verification_status();
