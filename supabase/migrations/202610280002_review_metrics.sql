-- Keep public product ratings consistent with reviews without granting product writes to shoppers.
CREATE INDEX reviews_product_idx ON public.reviews(product_id);
CREATE FUNCTION public.refresh_product_rating() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected_id bigint;
BEGIN
  affected_id := coalesce(NEW.product_id, OLD.product_id);
  UPDATE public.products p SET
    reviews_count = (SELECT count(*) FROM public.reviews r WHERE r.product_id = affected_id),
    rating = coalesce((SELECT round(avg(r.rating)::numeric, 1) FROM public.reviews r WHERE r.product_id = affected_id), 0)
  WHERE p.id = affected_id;
  IF TG_OP = 'UPDATE' AND OLD.product_id IS DISTINCT FROM NEW.product_id THEN
    UPDATE public.products p SET
      reviews_count = (SELECT count(*) FROM public.reviews r WHERE r.product_id = OLD.product_id),
      rating = coalesce((SELECT round(avg(r.rating)::numeric, 1) FROM public.reviews r WHERE r.product_id = OLD.product_id), 0)
    WHERE p.id = OLD.product_id;
  END IF;
  RETURN coalesce(NEW, OLD);
END $$;
CREATE TRIGGER review_rating_changed AFTER INSERT OR UPDATE OR DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.refresh_product_rating();
REVOKE ALL ON FUNCTION public.refresh_product_rating() FROM PUBLIC,anon,authenticated;
ALTER TABLE public.newsletter_subscribers ADD CONSTRAINT newsletter_email_format CHECK (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');
UPDATE public.products p SET reviews_count = (SELECT count(*) FROM public.reviews r WHERE r.product_id = p.id),
  rating = coalesce((SELECT round(avg(r.rating)::numeric, 1) FROM public.reviews r WHERE r.product_id = p.id), 0);
