// داده‌های نمونه برای زمانی که سرویس در دسترس نیست.
export const categories = [
  {
    "slug": "tops",
    "name": "تیشرت و پولوشرت",
    "image": "https://images.unsplash.com/photo-1773747310819-ae0ca63f5385?w=500&q=80&fit=crop",
    "localImage": "assets/products/knit-cream.jpg"
  },
  {
    "slug": "outerwear",
    "name": "کاپشن و پالتو",
    "image": "https://images.unsplash.com/photo-1648066380643-675d30c3cd17?w=500&q=80&fit=crop",
    "localImage": "assets/products/trench.jpg"
  },
  {
    "slug": "watches",
    "name": "ساعت",
    "image": "https://images.unsplash.com/photo-1777457900943-7fd2f7c42529?w=500&q=80&fit=crop",
    "localImage": "assets/products/watch-black.jpg"
  },
  {
    "slug": "bags",
    "name": "کیف",
    "image": "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=500&q=80&fit=crop",
    "localImage": "assets/products/bag-brown.jpg"
  },
  {
    "slug": "shoes",
    "name": "کفش",
    "image": "https://images.unsplash.com/photo-1553835584-c3eab150319e?w=500&q=80&fit=crop",
    "localImage": "assets/products/shoes-white.jpg"
  },
  {
    "slug": "accessories",
    "name": "اکسسوری",
    "image": "https://images.unsplash.com/photo-1695157712101-7336d70c373e?w=500&q=80&fit=crop",
    "localImage": "assets/products/sunglasses.jpg"
  }
];

export const brands = [
  {
    "slug": "zara",
    "name": "ZARA"
  },
  {
    "slug": "mango",
    "name": "MANGO"
  },
  {
    "slug": "nike",
    "name": "NIKE"
  },
  {
    "slug": "adidas",
    "name": "adidas"
  },
  {
    "slug": "hm",
    "name": "H&M"
  },
  {
    "slug": "massimo-dutti",
    "name": "Massimo Dutti"
  }
];

export const products = [
  {
    "id": 1,
    "name": "پلیور یقه گرد",
    "brand": "zara",
    "category": "tops",
    "gender": "men",
    "price": 890000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "کرم",
        "hex": "#d7c8b2"
      },
      {
        "name": "مشکی",
        "hex": "#222222"
      },
      {
        "name": "طوسی",
        "hex": "#a4a5a3"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "images": [
      "https://images.unsplash.com/photo-1773747310819-ae0ca63f5385?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1773747203295-dc002c421c33?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/knit-cream.jpg",
      "assets/products/knit-brown.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "پلیور یقه گرد، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-10-26T10:00:00Z"
  },
  {
    "id": 2,
    "name": "کتانی روزمره مردانه",
    "brand": "nike",
    "category": "shoes",
    "gender": "men",
    "price": 1450000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "سفید",
        "hex": "#f7f7f3"
      },
      {
        "name": "طوسی",
        "hex": "#a4a5a3"
      }
    ],
    "sizes": [
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "images": [
      "https://images.unsplash.com/photo-1553835584-c3eab150319e?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1751326147342-42326374d334?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/shoes-white.jpg",
      "assets/products/shoes-pair.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "کتانی روزمره مردانه، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-10-24T10:00:00Z"
  },
  {
    "id": 3,
    "name": "پیراهن کتان مشکی",
    "brand": "hm",
    "category": "tops",
    "gender": "men",
    "price": 680000,
    "oldPrice": 800000,
    "discountPercent": 15,
    "colors": [
      {
        "name": "مشکی",
        "hex": "#222222"
      },
      {
        "name": "سفید",
        "hex": "#f7f7f3"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "images": [
      "https://images.unsplash.com/photo-1519916340768-6710a9735b10?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1550505363-0ccfd722d763?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/shirt-black.jpg",
      "assets/products/shirt-black-2.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "پیراهن کتان مشکی، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "تخفیف"
    ],
    "createdAt": "2026-10-22T10:00:00Z"
  },
  {
    "id": 4,
    "name": "کیف دوشی زنانه",
    "brand": "mango",
    "category": "bags",
    "gender": "women",
    "price": 1950000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "قهوه‌ای",
        "hex": "#8b634e"
      },
      {
        "name": "کرم",
        "hex": "#d7c8b2"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1589363358751-ab05797e5629?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/bag-brown.jpg",
      "assets/products/bag-cream.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "کیف دوشی زنانه، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-10-20T10:00:00Z"
  },
  {
    "id": 5,
    "name": "ساعت مچی کلاسیک",
    "brand": "massimo-dutti",
    "category": "watches",
    "gender": "unisex",
    "price": 2450000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "مشکی",
        "hex": "#222222"
      },
      {
        "name": "طلایی",
        "hex": "#c5a75e"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1777457900943-7fd2f7c42529?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1451290337906-ac938fc89bce?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/watch-black.jpg",
      "assets/products/watch-gold.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "ساعت مچی کلاسیک، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-10-18T10:00:00Z"
  },
  {
    "id": 6,
    "name": "هودی اسلیم فیت",
    "brand": "adidas",
    "category": "tops",
    "gender": "men",
    "price": 1280000,
    "oldPrice": 1600000,
    "discountPercent": 20,
    "colors": [
      {
        "name": "طوسی",
        "hex": "#a4a5a3"
      },
      {
        "name": "مشکی",
        "hex": "#222222"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": [
      "https://images.unsplash.com/photo-1559436194-ec317a4bafeb?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1550505363-0ccfd722d763?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/hoodie.jpg",
      "assets/products/shirt-black-2.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "هودی اسلیم فیت، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "تخفیف"
    ],
    "createdAt": "2026-10-16T10:00:00Z"
  },
  {
    "id": 7,
    "name": "تیشرت نخی اورسایز",
    "brand": "zara",
    "category": "tops",
    "gender": "women",
    "price": 590000,
    "oldPrice": 740000,
    "discountPercent": 20,
    "colors": [
      {
        "name": "مشکی",
        "hex": "#222222"
      },
      {
        "name": "کرم",
        "hex": "#d7c8b2"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "images": [
      "https://images.unsplash.com/photo-1550505363-0ccfd722d763?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1773747310819-ae0ca63f5385?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/shirt-black-2.jpg",
      "assets/products/knit-cream.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "تیشرت نخی اورسایز، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "تخفیف"
    ],
    "createdAt": "2026-10-14T10:00:00Z"
  },
  {
    "id": 8,
    "name": "کتانی سفید مینیمال",
    "brand": "adidas",
    "category": "shoes",
    "gender": "women",
    "price": 1690000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "سفید",
        "hex": "#f7f7f3"
      },
      {
        "name": "بژ",
        "hex": "#bfaa91"
      }
    ],
    "sizes": [
      "38",
      "39",
      "40",
      "41"
    ],
    "images": [
      "https://images.unsplash.com/photo-1664343151236-2b788b177653?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1553835584-c3eab150319e?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/shoes-hand.jpg",
      "assets/products/shoes-white.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "کتانی سفید مینیمال، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-10-12T10:00:00Z"
  },
  {
    "id": 9,
    "name": "کفش روزمره اسپرت",
    "brand": "nike",
    "category": "shoes",
    "gender": "unisex",
    "price": 1850000,
    "oldPrice": 2250000,
    "discountPercent": 18,
    "colors": [
      {
        "name": "سفید",
        "hex": "#f7f7f3"
      },
      {
        "name": "طوسی",
        "hex": "#a4a5a3"
      }
    ],
    "sizes": [
      "39",
      "40",
      "41",
      "42",
      "43",
      "44"
    ],
    "images": [
      "https://images.unsplash.com/photo-1751326147342-42326374d334?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1553835584-c3eab150319e?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/shoes-pair.jpg",
      "assets/products/shoes-white.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "کفش روزمره اسپرت، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "تخفیف"
    ],
    "createdAt": "2026-10-10T10:00:00Z"
  },
  {
    "id": 10,
    "name": "کتانی رنگی بچگانه",
    "brand": "adidas",
    "category": "shoes",
    "gender": "kids",
    "price": 1150000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "سفید",
        "hex": "#f7f7f3"
      },
      {
        "name": "طوسی",
        "hex": "#a4a5a3"
      }
    ],
    "sizes": [
      "38",
      "39",
      "40"
    ],
    "images": [
      "https://images.unsplash.com/photo-1518362165686-c587a1de1003?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1751326147342-42326374d334?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/shoes-color.jpg",
      "assets/products/shoes-pair.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "کتانی رنگی بچگانه، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-10-08T10:00:00Z"
  },
  {
    "id": 11,
    "name": "کیف دستی چرم",
    "brand": "mango",
    "category": "bags",
    "gender": "women",
    "price": 2190000,
    "oldPrice": 2590000,
    "discountPercent": 15,
    "colors": [
      {
        "name": "قهوه‌ای",
        "hex": "#8b634e"
      },
      {
        "name": "مشکی",
        "hex": "#222222"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1589363358751-ab05797e5629?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/bag-cream.jpg",
      "assets/products/bag-brown.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "کیف دستی چرم، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "تخفیف"
    ],
    "createdAt": "2026-10-06T10:00:00Z"
  },
  {
    "id": 12,
    "name": "کیف مینی روزمره",
    "brand": "zara",
    "category": "bags",
    "gender": "women",
    "price": 1290000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "طوسی",
        "hex": "#a4a5a3"
      },
      {
        "name": "مشکی",
        "hex": "#222222"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1575202332411-b01fe9ace7a8?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1575403538007-acb790100421?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/bag-gray.jpg",
      "assets/products/bag-dark.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "کیف مینی روزمره، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-10-04T10:00:00Z"
  },
  {
    "id": 13,
    "name": "کیف کراس بادی",
    "brand": "hm",
    "category": "bags",
    "gender": "unisex",
    "price": 980000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "مشکی",
        "hex": "#222222"
      },
      {
        "name": "قهوه‌ای",
        "hex": "#8b634e"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1575403538007-acb790100421?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1575202332411-b01fe9ace7a8?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/bag-dark.jpg",
      "assets/products/bag-gray.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "کیف کراس بادی، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-10-02T10:00:00Z"
  },
  {
    "id": 14,
    "name": "ساعت بند چرمی",
    "brand": "massimo-dutti",
    "category": "watches",
    "gender": "men",
    "price": 2750000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "قهوه‌ای",
        "hex": "#8b634e"
      },
      {
        "name": "مشکی",
        "hex": "#222222"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1777457900943-7fd2f7c42529?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1526743655626-e3d757b13d61?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/watch-black.jpg",
      "assets/products/watch-set.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "ساعت بند چرمی، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-09-30T10:00:00Z"
  },
  {
    "id": 15,
    "name": "ساعت ظریف زنانه",
    "brand": "mango",
    "category": "watches",
    "gender": "women",
    "price": 1890000,
    "oldPrice": 2290000,
    "discountPercent": 17,
    "colors": [
      {
        "name": "طلایی",
        "hex": "#c5a75e"
      },
      {
        "name": "سفید",
        "hex": "#f7f7f3"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1451290337906-ac938fc89bce?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1526743655626-e3d757b13d61?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/watch-gold.jpg",
      "assets/products/watch-set.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "ساعت ظریف زنانه، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "تخفیف"
    ],
    "createdAt": "2026-09-28T10:00:00Z"
  },
  {
    "id": 16,
    "name": "ساعت استیل مینیمال",
    "brand": "zara",
    "category": "watches",
    "gender": "unisex",
    "price": 2350000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "طوسی",
        "hex": "#a4a5a3"
      },
      {
        "name": "مشکی",
        "hex": "#222222"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1526743655626-e3d757b13d61?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1777457900943-7fd2f7c42529?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/watch-set.jpg",
      "assets/products/watch-black.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "ساعت استیل مینیمال، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-09-26T10:00:00Z"
  },
  {
    "id": 17,
    "name": "پالتو بلند زنانه",
    "brand": "mango",
    "category": "outerwear",
    "gender": "women",
    "price": 3290000,
    "oldPrice": 3990000,
    "discountPercent": 18,
    "colors": [
      {
        "name": "بژ",
        "hex": "#bfaa91"
      },
      {
        "name": "مشکی",
        "hex": "#222222"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "images": [
      "https://images.unsplash.com/photo-1648066380643-675d30c3cd17?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1611025035970-27e2a8e9e09f?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/trench.jpg",
      "assets/products/coat-women.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "پالتو بلند زنانه، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "تخفیف"
    ],
    "createdAt": "2026-09-24T10:00:00Z"
  },
  {
    "id": 18,
    "name": "کت کژوال مردانه",
    "brand": "massimo-dutti",
    "category": "outerwear",
    "gender": "men",
    "price": 2890000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "بژ",
        "hex": "#bfaa91"
      },
      {
        "name": "مشکی",
        "hex": "#222222"
      }
    ],
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": [
      "https://images.unsplash.com/photo-1603233176974-0a4333ee6078?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1648066380643-675d30c3cd17?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/coat-men.jpg",
      "assets/products/trench.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "کت کژوال مردانه، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-09-22T10:00:00Z"
  },
  {
    "id": 19,
    "name": "بارانی کلاسیک",
    "brand": "zara",
    "category": "outerwear",
    "gender": "women",
    "price": 2650000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "کرم",
        "hex": "#d7c8b2"
      },
      {
        "name": "بژ",
        "hex": "#bfaa91"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "images": [
      "https://images.unsplash.com/photo-1611025035970-27e2a8e9e09f?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1648066380643-675d30c3cd17?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/coat-women.jpg",
      "assets/products/trench.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "بارانی کلاسیک، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-09-20T10:00:00Z"
  },
  {
    "id": 20,
    "name": "ژاکت بافت گرم",
    "brand": "hm",
    "category": "outerwear",
    "gender": "kids",
    "price": 1190000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "قهوه‌ای",
        "hex": "#8b634e"
      },
      {
        "name": "کرم",
        "hex": "#d7c8b2"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "images": [
      "https://images.unsplash.com/photo-1773747203295-dc002c421c33?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1773747310819-ae0ca63f5385?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/knit-brown.jpg",
      "assets/products/knit-cream.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "ژاکت بافت گرم، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-09-18T10:00:00Z"
  },
  {
    "id": 21,
    "name": "عینک آفتابی کلاسیک",
    "brand": "zara",
    "category": "accessories",
    "gender": "unisex",
    "price": 790000,
    "oldPrice": 990000,
    "discountPercent": 20,
    "colors": [
      {
        "name": "مشکی",
        "hex": "#222222"
      },
      {
        "name": "قهوه‌ای",
        "hex": "#8b634e"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1695157712101-7336d70c373e?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1621341103818-01dada8c6ef8?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/sunglasses.jpg",
      "assets/editorial/editorial-watch.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "عینک آفتابی کلاسیک، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "تخفیف"
    ],
    "createdAt": "2026-09-16T10:00:00Z"
  },
  {
    "id": 22,
    "name": "شال بافت نرم",
    "brand": "mango",
    "category": "accessories",
    "gender": "women",
    "price": 490000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "کرم",
        "hex": "#d7c8b2"
      },
      {
        "name": "قهوه‌ای",
        "hex": "#8b634e"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1773747203295-dc002c421c33?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1633008004535-b255bab275cc?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/knit-brown.jpg",
      "assets/editorial/editorial-knit.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "شال بافت نرم، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-09-14T10:00:00Z"
  },
  {
    "id": 23,
    "name": "کمربند چرم روزمره",
    "brand": "massimo-dutti",
    "category": "accessories",
    "gender": "men",
    "price": 890000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "قهوه‌ای",
        "hex": "#8b634e"
      },
      {
        "name": "مشکی",
        "hex": "#222222"
      }
    ],
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "images": [
      "https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1575403538007-acb790100421?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/products/bag-brown.jpg",
      "assets/products/bag-dark.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "کمربند چرم روزمره، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-09-12T10:00:00Z"
  },
  {
    "id": 24,
    "name": "اکسسوری استایل روزانه",
    "brand": "hm",
    "category": "accessories",
    "gender": "kids",
    "price": 390000,
    "oldPrice": null,
    "discountPercent": 0,
    "colors": [
      {
        "name": "سفید",
        "hex": "#f7f7f3"
      },
      {
        "name": "طوسی",
        "hex": "#a4a5a3"
      }
    ],
    "sizes": [
      "تک‌سایز"
    ],
    "images": [
      "https://images.unsplash.com/photo-1621341103818-01dada8c6ef8?w=800&q=80&fit=crop",
      "https://images.unsplash.com/photo-1695157712101-7336d70c373e?w=800&q=80&fit=crop"
    ],
    "localImages": [
      "assets/editorial/editorial-watch.jpg",
      "assets/products/sunglasses.jpg"
    ],
    "stock": 12,
    "rating": 4.7,
    "reviewsCount": 3,
    "description": "اکسسوری استایل روزانه، انتخابی راحت و خوش‌دوخت برای ساختن استایلی ساده و ماندگار است. با جزئیات کاربردی و طراحی مینیمال، به‌راحتی با آیتم‌های دیگر کمد لباس شما هماهنگ می‌شود.",
    "specs": {
      "جنس": "متناسب با طراحی محصول",
      "سبک": "روزمره و مینیمال",
      "کشور طراحی": "ترکیه",
      "نحوه نگهداری": "مطابق راهنمای روی محصول"
    },
    "tags": [
      "پرفروش",
      "جدید"
    ],
    "createdAt": "2026-09-10T10:00:00Z"
  }
];

export const posts = [
  {
    "id": 1,
    "slug": "capsule-wardrobe",
    "title": "کمد کپسولی چیست و چطور آن را بسازیم؟",
    "category": "راهنمای استایل",
    "excerpt": "با چند انتخاب هوشمندانه، کمدی کاربردی و استایلی همیشه تازه داشته باشید.",
    "image": "https://images.unsplash.com/photo-1633008004535-b255bab275cc?w=900&q=80&fit=crop",
    "localImage": "assets/editorial/editorial-knit.jpg",
    "readTime": 6,
    "publishedAt": "2026-10-22",
    "body": [
      "با چند انتخاب هوشمندانه، کمدی کاربردی و استایلی همیشه تازه داشته باشید.",
      "استایل خوب بیشتر از هر چیز به شناخت سلیقه و نیازهای روزمره شما بستگی دارد. به جای دنبال کردن همه ترندها، آیتم‌هایی را انتخاب کنید که با هم هماهنگ‌اند و در آن‌ها احساس راحتی دارید.",
      "کیفیت پارچه، تناسب اندازه و جزئیات دوخت را فراموش نکنید. ترکیب رنگ‌های خنثی با یک آیتم شاخص، راهی ساده برای داشتن ظاهری شخصی و ماندگار است.",
      "در استایلند می‌توانید انتخاب‌های متنوع را کنار هم ببینید و با حوصله، چیزی را پیدا کنید که واقعاً دوستش دارید."
    ]
  },
  {
    "id": 2,
    "slug": "autumn-style",
    "title": "راهنمای ساخت یک استایل پاییزی بی‌نقص",
    "category": "ترندها",
    "excerpt": "لایه‌لایه بپوشید و با رنگ‌های گرم فصل، استایل شخصی خودتان را بسازید.",
    "image": "https://images.unsplash.com/photo-1507297448044-a99b358cd06e?w=900&q=80&fit=crop",
    "localImage": "assets/editorial/editorial-couple.jpg",
    "readTime": 5,
    "publishedAt": "2026-10-17",
    "body": [
      "لایه‌لایه بپوشید و با رنگ‌های گرم فصل، استایل شخصی خودتان را بسازید.",
      "استایل خوب بیشتر از هر چیز به شناخت سلیقه و نیازهای روزمره شما بستگی دارد. به جای دنبال کردن همه ترندها، آیتم‌هایی را انتخاب کنید که با هم هماهنگ‌اند و در آن‌ها احساس راحتی دارید.",
      "کیفیت پارچه، تناسب اندازه و جزئیات دوخت را فراموش نکنید. ترکیب رنگ‌های خنثی با یک آیتم شاخص، راهی ساده برای داشتن ظاهری شخصی و ماندگار است.",
      "در استایلند می‌توانید انتخاب‌های متنوع را کنار هم ببینید و با حوصله، چیزی را پیدا کنید که واقعاً دوستش دارید."
    ]
  },
  {
    "id": 3,
    "slug": "right-sneakers",
    "title": "چطور کتانی مناسب استایل خودمان را انتخاب کنیم؟",
    "category": "راهنمای خرید",
    "excerpt": "از جزئیات راحتی تا رنگ و فرم؛ هر آنچه پیش از انتخاب کفش باید بدانید.",
    "image": "https://images.unsplash.com/photo-1553835584-c3eab150319e?w=900&q=80&fit=crop",
    "localImage": "assets/products/shoes-white.jpg",
    "readTime": 4,
    "publishedAt": "2026-10-12",
    "body": [
      "از جزئیات راحتی تا رنگ و فرم؛ هر آنچه پیش از انتخاب کفش باید بدانید.",
      "استایل خوب بیشتر از هر چیز به شناخت سلیقه و نیازهای روزمره شما بستگی دارد. به جای دنبال کردن همه ترندها، آیتم‌هایی را انتخاب کنید که با هم هماهنگ‌اند و در آن‌ها احساس راحتی دارید.",
      "کیفیت پارچه، تناسب اندازه و جزئیات دوخت را فراموش نکنید. ترکیب رنگ‌های خنثی با یک آیتم شاخص، راهی ساده برای داشتن ظاهری شخصی و ماندگار است.",
      "در استایلند می‌توانید انتخاب‌های متنوع را کنار هم ببینید و با حوصله، چیزی را پیدا کنید که واقعاً دوستش دارید."
    ]
  },
  {
    "id": 4,
    "slug": "accessory-guide",
    "title": "اکسسوری؛ جزئیات کوچکی که تفاوت می‌سازند",
    "category": "راهنمای استایل",
    "excerpt": "چند ایده ساده برای انتخاب اکسسوری و کامل کردن استایل روزمره.",
    "image": "https://images.unsplash.com/photo-1621341103818-01dada8c6ef8?w=900&q=80&fit=crop",
    "localImage": "assets/editorial/editorial-watch.jpg",
    "readTime": 6,
    "publishedAt": "2026-10-07",
    "body": [
      "چند ایده ساده برای انتخاب اکسسوری و کامل کردن استایل روزمره.",
      "استایل خوب بیشتر از هر چیز به شناخت سلیقه و نیازهای روزمره شما بستگی دارد. به جای دنبال کردن همه ترندها، آیتم‌هایی را انتخاب کنید که با هم هماهنگ‌اند و در آن‌ها احساس راحتی دارید.",
      "کیفیت پارچه، تناسب اندازه و جزئیات دوخت را فراموش نکنید. ترکیب رنگ‌های خنثی با یک آیتم شاخص، راهی ساده برای داشتن ظاهری شخصی و ماندگار است.",
      "در استایلند می‌توانید انتخاب‌های متنوع را کنار هم ببینید و با حوصله، چیزی را پیدا کنید که واقعاً دوستش دارید."
    ]
  },
  {
    "id": 5,
    "slug": "winter-layers",
    "title": "هنر لایه‌پوشی در روزهای سرد",
    "category": "ترندها",
    "excerpt": "از بافت نرم تا پالتوی کلاسیک؛ با خیال راحت برای سرما آماده شوید.",
    "image": "https://images.unsplash.com/photo-1648066380643-675d30c3cd17?w=900&q=80&fit=crop",
    "localImage": "assets/products/trench.jpg",
    "readTime": 7,
    "publishedAt": "2026-10-02",
    "body": [
      "از بافت نرم تا پالتوی کلاسیک؛ با خیال راحت برای سرما آماده شوید.",
      "استایل خوب بیشتر از هر چیز به شناخت سلیقه و نیازهای روزمره شما بستگی دارد. به جای دنبال کردن همه ترندها، آیتم‌هایی را انتخاب کنید که با هم هماهنگ‌اند و در آن‌ها احساس راحتی دارید.",
      "کیفیت پارچه، تناسب اندازه و جزئیات دوخت را فراموش نکنید. ترکیب رنگ‌های خنثی با یک آیتم شاخص، راهی ساده برای داشتن ظاهری شخصی و ماندگار است.",
      "در استایلند می‌توانید انتخاب‌های متنوع را کنار هم ببینید و با حوصله، چیزی را پیدا کنید که واقعاً دوستش دارید."
    ]
  },
  {
    "id": 6,
    "slug": "care-for-clothes",
    "title": "چطور از لباس‌های محبوبمان مراقبت کنیم؟",
    "category": "راهنمای خرید",
    "excerpt": "چند عادت ساده برای اینکه لباس‌ها مدت بیشتری زیبا بمانند.",
    "image": "https://images.unsplash.com/photo-1773747310819-ae0ca63f5385?w=900&q=80&fit=crop",
    "localImage": "assets/products/knit-cream.jpg",
    "readTime": 3,
    "publishedAt": "2026-09-27",
    "body": [
      "چند عادت ساده برای اینکه لباس‌ها مدت بیشتری زیبا بمانند.",
      "استایل خوب بیشتر از هر چیز به شناخت سلیقه و نیازهای روزمره شما بستگی دارد. به جای دنبال کردن همه ترندها، آیتم‌هایی را انتخاب کنید که با هم هماهنگ‌اند و در آن‌ها احساس راحتی دارید.",
      "کیفیت پارچه، تناسب اندازه و جزئیات دوخت را فراموش نکنید. ترکیب رنگ‌های خنثی با یک آیتم شاخص، راهی ساده برای داشتن ظاهری شخصی و ماندگار است.",
      "در استایلند می‌توانید انتخاب‌های متنوع را کنار هم ببینید و با حوصله، چیزی را پیدا کنید که واقعاً دوستش دارید."
    ]
  }
];

