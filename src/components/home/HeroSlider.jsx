import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { optimizedImageUrl, optimizedImageSrcSet } from '../../utils/imageUrl';

const DEFAULT_BANNERS = [
  {
    title: 'এই মৌসুমের বিশেষ পণ্য',
    subtitle: 'খাঁটি খেজুরের গুড়, গ্রামের স্বাদ আপনার ঘরে',
    description: 'প্রাকৃতিক উপায়ে তৈরি ভেজালমুক্ত খেজুরের গুড়। শীতের সেরা স্বাদ এখন আপনার ঘরে।',
    image: 'https://proyjon.com.bd/uploads/product/2024-09-15-66e70b46e80f9.jpg',
    link: '/shop?category=khejurer-gur',
    linkText: 'গুড়ের সংগ্রহ দেখুন',
  },
  {
    title: 'বাগান থেকে সরাসরি',
    subtitle: 'মৌসুমি আমের মিষ্টি স্বাদ, এখন আপনার ঘরে',
    description: 'বাছাই করা বাগান থেকে তাজা ও রসালো আম, সারা দেশে নিরাপদ ডেলিভারিতে।',
    image: 'https://www.thefifthorchard.com/cdn/shop/files/organic-right-img-1.webp?v=1773162976&width=1946',
    link: '/shop?category=mango',
    linkText: 'আমের সংগ্রহ দেখুন',
  },
];

export default function HeroSlider() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const dragRef = useRef({ startX: 0, startY: 0, moved: false });
  const slides = banners.length ? banners : DEFAULT_BANNERS;

  useEffect(() => {
    API.get('/banners').then(res => {
      setBanners(res.data.banners || []);
    }).catch(() => {
      setBanners([]);
    });
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrent((index + slides.length) % slides.length);
  };

  const handleTouchStart = (event) => {
    if (slides.length <= 1) return;
    const touch = event.touches[0];
    dragRef.current = { startX: touch.clientX, startY: touch.clientY, moved: false };
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (event) => {
    if (!isDragging || slides.length <= 1) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - dragRef.current.startX;
    const deltaY = touch.clientY - dragRef.current.startY;

    if (Math.abs(deltaX) > 8) dragRef.current.moved = true;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDragOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    const width = sliderRef.current?.offsetWidth || 0;
    const threshold = Math.max(50, width * 0.14);

    if (dragOffset <= -threshold) {
      goToSlide(current + 1);
    } else if (dragOffset >= threshold) {
      goToSlide(current - 1);
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const handleMouseDown = (event) => {
    if (event.button !== 0 || slides.length <= 1) return;
    event.preventDefault();
    dragRef.current = { startX: event.clientX, startY: event.clientY, moved: false };
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (event) => {
    if (!isDragging || slides.length <= 1) return;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;

    if (Math.abs(deltaX) > 8) dragRef.current.moved = true;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDragOffset(deltaX);
    }
  };

  const handleLinkClick = (event) => {
    if (dragRef.current.moved) {
      event.preventDefault();
      dragRef.current.moved = false;
    }
  };

  return (
    <section
      ref={sliderRef}
      className="relative h-[clamp(360px,39vw,510px)] min-h-[360px] overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div
        className={`flex h-full ${isDragging ? '' : 'transition-transform duration-700 ease-out'}`}
        style={{ transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))` }}
      >
        {slides.map((b, i) => (
          <div key={i} className="relative flex h-full min-w-full items-center">
            <picture className="absolute inset-0 block">
              {b.mobileImage && <source media="(max-width: 767px)" srcSet={optimizedImageUrl(b.mobileImage, { width: 1000, quality: 'auto:good' })} />}
              <img src={optimizedImageUrl(b.image, { width: 2000, quality: 'auto:good' })} srcSet={optimizedImageSrcSet(b.image, [1000, 1600, 2000], { quality: 'auto:good' })} sizes="100vw" alt={b.title || 'Homepage banner'} className="h-full w-full object-cover object-center" />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-r from-[#063a20]/95 via-[#063a20]/72 to-[#063a20]/8" />
            <div className="relative z-10 w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-10 text-white">
              <div className="max-w-xl">
                <span className="inline-flex rounded-full bg-gold px-3 py-1 text-[11px] font-bold tracking-[0.04em] text-[#173326] mb-3 sm:mb-4">{b.title}</span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.12] mb-3 sm:mb-4">{b.subtitle}</h1>
                <p className="text-sm sm:text-base leading-relaxed mb-5 sm:mb-6 max-w-md text-[#f5f0e8]">{b.description}</p>
              <Link
                to={b.link || '/shop'}
                onClick={handleLinkClick}
                className="inline-block rounded-full bg-oxblood border border-oxblood text-white px-6 sm:px-7 py-3 text-xs font-bold tracking-[0.08em] hover:bg-white hover:text-oxblood-dark hover:border-white transition-all"
              >
                {b.linkText || 'Shop Now'}
              </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goToSlide(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-[22px]' : 'bg-white/50 w-2'}`} />
        ))}
      </div>
    </section>
  );
}
