import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function Banner() {
  const banners = [
    "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1500&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1500&q=80",
  ];

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop
        className="w-full h-full"
      >
        {banners.map((bg, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative w-full h-full bg-cover bg-center group overflow-hidden transform transition-transform duration-700 hover:scale-[1.03]"
              style={{ backgroundImage: `url(${bg})` }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
