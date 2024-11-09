-- Create storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);

-- Allow authenticated users to upload images
create policy "Authenticated users can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- Allow public access to view product images
create policy "Public can view product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

-- Allow users to delete their own images
create policy "Users can delete their own product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);