import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function Banner() {
  const banners = [
    {
      image:
        "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1500&q=80",
      title: "ThenFong Collection",
      subtitle: "Phong cách tối giản, sang trọng cho mọi khoảnh khắc.",
      cta: "Khám phá ngay",
    },
    {
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80",
      title: "Ưu đãi độc quyền",
      subtitle: "Giảm giá lên đến 40% cho đơn hàng đầu tiên.",
      cta: "Nhận ưu đãi",
    },
    {
      image:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1500&q=80",
      title: "Trải nghiệm khác biệt",
      subtitle: "Chất lượng từ chi tiết nhỏ nhất.",
      cta: "Mua ngay",
    },
  ];

  return (
    <div className="relative w-full h-[420px] md:h-[520px] overflow-hidden">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop
        className="w-full h-full"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center scale-[1.03]"
                style={{ backgroundImage: `url(${banner.image})` }}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/10" />

              {/* Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center">
                <div className="max-w-xl md:max-w-2xl space-y-5 animate-fadeIn">
                  <p className="text-xs uppercase tracking-[0.3em] text-teal-200/90">
                    THENFONG STORE
                  </p>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]">
                    {banner.title}
                  </h1>
                  <p className="text-sm md:text-base text-gray-100/90 max-w-xl">
                    {banner.subtitle}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <button className="inline-flex items-center px-6 md:px-7 py-2.5 md:py-3 rounded-full text-sm md:text-base font-semibold text-white bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 shadow-[0_10px_30px_rgba(45,212,191,0.35)] hover:shadow-[0_14px_40px_rgba(45,212,191,0.5)] hover:translate-y-[1px] transition-all">
                      {banner.cta}
                    </button>

                    <button className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-white/90 border border-white/40 bg-white/5 backdrop-blur-lg hover:bg-white/10 hover:border-white/70 transition-all">
                      Xem bộ sưu tập
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-white/80">
                <span className="inline-block w-7 h-[1px] bg-white/50" />
                Cuộn xuống để khám phá
                <span className="inline-block w-7 h-[1px] bg-white/50" />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
