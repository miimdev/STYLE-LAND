-- داده‌های نمونه؛ قابل اجرای مجدد در یک تراکنش.
CREATE TEMP TABLE seed_images (key text PRIMARY KEY, image text, local_image text) ON COMMIT DROP;
INSERT INTO seed_images VALUES
('knit-cream','https://images.unsplash.com/photo-1773747310819-ae0ca63f5385?w=800&q=80&fit=crop','assets/products/knit-cream.jpg'),
('knit-brown','https://images.unsplash.com/photo-1773747203295-dc002c421c33?w=800&q=80&fit=crop','assets/products/knit-brown.jpg'),
('hoodie','https://images.unsplash.com/photo-1559436194-ec317a4bafeb?w=800&q=80&fit=crop','assets/products/hoodie.jpg'),
('shirt-black','https://images.unsplash.com/photo-1519916340768-6710a9735b10?w=800&q=80&fit=crop','assets/products/shirt-black.jpg'),
('shirt-black-2','https://images.unsplash.com/photo-1550505363-0ccfd722d763?w=800&q=80&fit=crop','assets/products/shirt-black-2.jpg'),
('coat-men','https://images.unsplash.com/photo-1603233176974-0a4333ee6078?w=800&q=80&fit=crop','assets/products/coat-men.jpg'),
('coat-women','https://images.unsplash.com/photo-1611025035970-27e2a8e9e09f?w=800&q=80&fit=crop','assets/products/coat-women.jpg'),
('trench','https://images.unsplash.com/photo-1648066380643-675d30c3cd17?w=800&q=80&fit=crop','assets/products/trench.jpg'),
('bag-brown','https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=800&q=80&fit=crop','assets/products/bag-brown.jpg'),
('bag-cream','https://images.unsplash.com/photo-1589363358751-ab05797e5629?w=800&q=80&fit=crop','assets/products/bag-cream.jpg'),
('bag-dark','https://images.unsplash.com/photo-1575403538007-acb790100421?w=800&q=80&fit=crop','assets/products/bag-dark.jpg'),
('bag-gray','https://images.unsplash.com/photo-1575202332411-b01fe9ace7a8?w=800&q=80&fit=crop','assets/products/bag-gray.jpg'),
('watch-black','https://images.unsplash.com/photo-1777457900943-7fd2f7c42529?w=800&q=80&fit=crop','assets/products/watch-black.jpg'),
('watch-gold','https://images.unsplash.com/photo-1451290337906-ac938fc89bce?w=800&q=80&fit=crop','assets/products/watch-gold.jpg'),
('watch-set','https://images.unsplash.com/photo-1526743655626-e3d757b13d61?w=800&q=80&fit=crop','assets/products/watch-set.jpg'),
('shoes-color','https://images.unsplash.com/photo-1518362165686-c587a1de1003?w=800&q=80&fit=crop','assets/products/shoes-color.jpg'),
('shoes-white','https://images.unsplash.com/photo-1553835584-c3eab150319e?w=800&q=80&fit=crop','assets/products/shoes-white.jpg'),
('shoes-pair','https://images.unsplash.com/photo-1751326147342-42326374d334?w=800&q=80&fit=crop','assets/products/shoes-pair.jpg'),
('shoes-hand','https://images.unsplash.com/photo-1664343151236-2b788b177653?w=800&q=80&fit=crop','assets/products/shoes-hand.jpg'),
('sunglasses','https://images.unsplash.com/photo-1695157712101-7336d70c373e?w=800&q=80&fit=crop','assets/products/sunglasses.jpg'),
('editorial-men','https://images.unsplash.com/photo-1596993100471-c3905dafa78e?w=800&q=80&fit=crop','assets/editorial/editorial-men.jpg'),
('editorial-couple','https://images.unsplash.com/photo-1507297448044-a99b358cd06e?w=800&q=80&fit=crop','assets/editorial/editorial-couple.jpg'),
('editorial-watch','https://images.unsplash.com/photo-1621341103818-01dada8c6ef8?w=800&q=80&fit=crop','assets/editorial/editorial-watch.jpg'),
('editorial-knit','https://images.unsplash.com/photo-1633008004535-b255bab275cc?w=800&q=80&fit=crop','assets/editorial/editorial-knit.jpg');

INSERT INTO public.categories(slug,name,image,local_image)
SELECT v.slug,v.name,i.image,i.local_image FROM (VALUES
('tops','تیشرت و پولوشرت','knit-cream'),
('outerwear','کاپشن و پالتو','trench'),
('watches','ساعت','watch-black'),
('bags','کیف','bag-brown'),
('shoes','کفش','shoes-white'),
('accessories','اکسسوری','sunglasses')) v(slug,name,img) JOIN seed_images i ON i.key=v.img ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.brands(slug,name) VALUES ('zara','ZARA'),('mango','MANGO'),('nike','NIKE'),('adidas','adidas'),('hm','H&M'),('massimo-dutti','Massimo Dutti') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products(id,name,brand,category,gender,price,old_price,discount_percent,colors,sizes,images,local_images,stock,rating,reviews_count,description,specs,tags,created_at)
SELECT v.id,v.name,v.brand,v.category,v.gender,v.price,nullif(v.old_price,0),
CASE WHEN v.old_price > 0 THEN round((v.old_price-v.price)::numeric*100/v.old_price) ELSE 0 END,
(SELECT jsonb_agg(jsonb_build_object('name',split_part(c,'=',1),'hex',split_part(c,'=',2))) FROM unnest(string_to_array(v.colors,'|')) c),
to_jsonb(string_to_array(v.sizes,',')),jsonb_build_array(a.image,b.image),jsonb_build_array(a.local_image,b.local_image),12,4.7,3,
v.name || '، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با طراحی مینیمال به‌راحتی با کمد لباس شما هماهنگ می‌شود.',
jsonb_build_object('جنس','متناسب با طراحی محصول','سبک','روزمره و مینیمال','نحوه نگهداری','مطابق راهنمای روی محصول'),
CASE WHEN v.old_price > 0 THEN '["پرفروش","تخفیف"]'::jsonb ELSE '["پرفروش","جدید"]'::jsonb END,
'2026-10-28T10:00:00Z'::timestamptz - (v.id * interval '2 days')
FROM (VALUES
(1,'پلیور یقه گرد','zara','tops','men',890000,0,'کرم=#d7c8b2|مشکی=#222222|طوسی=#a4a5a3','S,M,L,XL','knit-cream','knit-brown'),
(2,'کتانی روزمره مردانه','nike','shoes','men',1450000,0,'سفید=#f7f7f3|طوسی=#a4a5a3','40,41,42,43,44','shoes-white','shoes-pair'),
(3,'پیراهن کتان مشکی','hm','tops','men',680000,800000,'مشکی=#222222|سفید=#f7f7f3','S,M,L,XL','shirt-black','shirt-black-2'),
(4,'کیف دوشی زنانه','mango','bags','women',1950000,0,'قهوه‌ای=#8b634e|کرم=#d7c8b2','تک‌سایز','bag-brown','bag-cream'),
(5,'ساعت مچی کلاسیک','massimo-dutti','watches','unisex',2450000,0,'مشکی=#222222|طلایی=#c5a75e','تک‌سایز','watch-black','watch-gold'),
(6,'هودی اسلیم فیت','adidas','tops','men',1280000,1600000,'طوسی=#a4a5a3|مشکی=#222222','S,M,L,XL,XXL','hoodie','shirt-black-2'),
(7,'تیشرت نخی اورسایز','zara','tops','women',590000,740000,'مشکی=#222222|کرم=#d7c8b2','S,M,L,XL','shirt-black-2','knit-cream'),
(8,'کتانی سفید مینیمال','adidas','shoes','women',1690000,0,'سفید=#f7f7f3|بژ=#bfaa91','38,39,40,41','shoes-hand','shoes-white'),
(9,'کفش روزمره اسپرت','nike','shoes','unisex',1850000,2250000,'سفید=#f7f7f3|طوسی=#a4a5a3','39,40,41,42,43,44','shoes-pair','shoes-white'),
(10,'کتانی رنگی بچگانه','adidas','shoes','kids',1150000,0,'سفید=#f7f7f3|طوسی=#a4a5a3','38,39,40','shoes-color','shoes-pair'),
(11,'کیف دستی چرم','mango','bags','women',2190000,2590000,'قهوه‌ای=#8b634e|مشکی=#222222','تک‌سایز','bag-cream','bag-brown'),
(12,'کیف مینی روزمره','zara','bags','women',1290000,0,'طوسی=#a4a5a3|مشکی=#222222','تک‌سایز','bag-gray','bag-dark'),
(13,'کیف کراس بادی','hm','bags','unisex',980000,0,'مشکی=#222222|قهوه‌ای=#8b634e','تک‌سایز','bag-dark','bag-gray'),
(14,'ساعت بند چرمی','massimo-dutti','watches','men',2750000,0,'قهوه‌ای=#8b634e|مشکی=#222222','تک‌سایز','watch-black','watch-set'),
(15,'ساعت ظریف زنانه','mango','watches','women',1890000,2290000,'طلایی=#c5a75e|سفید=#f7f7f3','تک‌سایز','watch-gold','watch-set'),
(16,'ساعت استیل مینیمال','zara','watches','unisex',2350000,0,'طوسی=#a4a5a3|مشکی=#222222','تک‌سایز','watch-set','watch-black'),
(17,'پالتو بلند زنانه','mango','outerwear','women',3290000,3990000,'بژ=#bfaa91|مشکی=#222222','S,M,L,XL','trench','coat-women'),
(18,'کت کژوال مردانه','massimo-dutti','outerwear','men',2890000,0,'بژ=#bfaa91|مشکی=#222222','M,L,XL,XXL','coat-men','trench'),
(19,'بارانی کلاسیک','zara','outerwear','women',2650000,0,'کرم=#d7c8b2|بژ=#bfaa91','S,M,L','coat-women','trench'),
(20,'ژاکت بافت گرم','hm','outerwear','kids',1190000,0,'قهوه‌ای=#8b634e|کرم=#d7c8b2','S,M,L','knit-brown','knit-cream'),
(21,'عینک آفتابی کلاسیک','zara','accessories','unisex',790000,990000,'مشکی=#222222|قهوه‌ای=#8b634e','تک‌سایز','sunglasses','editorial-watch'),
(22,'شال بافت نرم','mango','accessories','women',490000,0,'کرم=#d7c8b2|قهوه‌ای=#8b634e','تک‌سایز','knit-brown','editorial-knit'),
(23,'کمربند چرم روزمره','massimo-dutti','accessories','men',890000,0,'قهوه‌ای=#8b634e|مشکی=#222222','M,L,XL','bag-brown','bag-dark'),
(24,'اکسسوری استایل روزانه','hm','accessories','kids',390000,0,'سفید=#f7f7f3|طوسی=#a4a5a3','تک‌سایز','editorial-watch','sunglasses')) AS v(id,name,brand,category,gender,price,old_price,colors,sizes,img,img2)
JOIN seed_images a ON a.key=v.img JOIN seed_images b ON b.key=v.img2 ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants(product_id,color,color_hex,size,stock)
SELECT p.id,c->>'name',c->>'hex',s.value,12 FROM public.products p
CROSS JOIN LATERAL jsonb_array_elements(p.colors) c CROSS JOIN LATERAL jsonb_array_elements_text(p.sizes) s(value)
ON CONFLICT (product_id,color,size) DO NOTHING;

INSERT INTO public.blog_posts(id,slug,title,category,excerpt,image,local_image,read_time,published_at,body)
SELECT v.id,v.slug,v.title,v.category,v.excerpt,i.image,i.local_image,v.minutes,v.published_at::date,
jsonb_build_array(v.excerpt,'استایل خوب بیشتر از هر چیز به شناخت سلیقه و نیازهای روزمره شما بستگی دارد. آیتم‌هایی را انتخاب کنید که با هم هماهنگ‌اند و در آن‌ها احساس راحتی دارید.','کیفیت پارچه، تناسب اندازه و جزئیات را فراموش نکنید. ترکیب رنگ‌های خنثی با یک آیتم شاخص، راهی ساده برای داشتن ظاهری ماندگار است.','در استایلند انتخاب‌های متنوع را کنار هم ببینید و چیزی را پیدا کنید که واقعاً دوستش دارید.')
FROM (VALUES
(1,'capsule-wardrobe','کمد کپسولی چیست و چطور آن را بسازیم؟','راهنمای استایل','با چند انتخاب هوشمندانه، کمدی کاربردی و استایلی همیشه تازه داشته باشید.','editorial-knit',6,'2026-10-22'),
(2,'autumn-style','راهنمای ساخت یک استایل پاییزی بی‌نقص','ترندها','لایه‌لایه بپوشید و با رنگ‌های گرم فصل، استایل شخصی خودتان را بسازید.','editorial-couple',5,'2026-10-17'),
(3,'right-sneakers','چطور کتانی مناسب استایل خودمان را انتخاب کنیم؟','راهنمای خرید','از جزئیات راحتی تا رنگ و فرم؛ هر آنچه پیش از انتخاب کفش باید بدانید.','shoes-white',4,'2026-10-12'),
(4,'accessory-guide','اکسسوری؛ جزئیات کوچکی که تفاوت می‌سازند','راهنمای استایل','چند ایده ساده برای انتخاب اکسسوری و کامل کردن استایل روزمره.','editorial-watch',6,'2026-10-07'),
(5,'winter-layers','هنر لایه‌پوشی در روزهای سرد','ترندها','از بافت نرم تا پالتوی کلاسیک؛ با خیال راحت برای سرما آماده شوید.','trench',7,'2026-10-02'),
(6,'care-for-clothes','چطور از لباس‌های محبوبمان مراقبت کنیم؟','راهنمای خرید','چند عادت ساده برای اینکه لباس‌ها مدت بیشتری زیبا بمانند.','knit-cream',3,'2026-09-27')) v(id,slug,title,category,excerpt,img,minutes,published_at) JOIN seed_images i ON i.key=v.img ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.reviews(product_id,display_name,rating,comment,seed_key)
SELECT p.id,v.name,v.rating,v.comment,p.id::text || '-' || v.n::text FROM public.products p CROSS JOIN (VALUES
(1,'سارا',5,'کیفیت و جزئیاتش خیلی خوب بود، ممنون از استایلند.'),
(2,'علی',5,'دقیقاً مطابق توضیحات بود و با خیال راحت انتخاب کردم.'),
(3,'مریم',4,'خوش‌دوخت و کاربردی؛ از انتخابم راضی‌ام.')) v(n,name,rating,comment) ON CONFLICT (seed_key) DO NOTHING;

INSERT INTO public.coupons(code,discount_percent,active) VALUES ('STYLE10',10,true) ON CONFLICT (code) DO NOTHING;
