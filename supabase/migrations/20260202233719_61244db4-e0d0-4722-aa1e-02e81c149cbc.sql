-- Enable realtime for course_dates table to show live capacity
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_dates;

-- Create a function to update current_participants when registration status changes
CREATE OR REPLACE FUNCTION public.update_course_participants()
RETURNS TRIGGER AS $$
BEGIN
    -- When a registration is confirmed, increment participants
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        UPDATE public.course_dates
        SET current_participants = current_participants + 1
        WHERE id = NEW.course_date_id;
    -- When a registration is unconfirmed (cancelled, etc.), decrement participants
    ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
        UPDATE public.course_dates
        SET current_participants = GREATEST(0, current_participants - 1)
        WHERE id = NEW.course_date_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to automatically update participant count
DROP TRIGGER IF EXISTS update_course_participants_trigger ON public.registrations;
CREATE TRIGGER update_course_participants_trigger
AFTER INSERT OR UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_course_participants();