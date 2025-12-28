import React from 'react';

const BANNERS = [
  {
    id: 1,
    title: 'Summer Wellness',
    subtitle: 'ลด 50% ตรวจสุขภาพ',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800', // Yoga on beach for Summer vibe
    color: 'from-blue-400 to-cyan-300' // Lighter gradient for summer feel
  },
  {
    id: 2,
    title: 'Healthy Food',
    subtitle: 'ส่งฟรี ทุกออเดอร์',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    color: 'from-green-600 to-emerald-500'
  },
  {
    id: 3,
    title: 'Dental Care',
    subtitle: 'ขูดหินปูน 900.-',
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800',
    color: 'from-purple-600 to-indigo-500'
  }
];

export const BannerCarousel: React.FC = () => {
  return (
    <div className="flex w-full gap-4 overflow-x-auto px-5 pb-2 pt-2 snap-x mandatory no-scrollbar">
      {BANNERS.map((banner) => (
        <div 
          key={banner.id} 
          className="relative min-w-[85%] snap-center overflow-hidden rounded-2xl shadow-md group"
        >
          <div className="aspect-[2.4/1] w-full relative">
            <img 
              src={banner.imageUrl} 
              alt={banner.title} 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} opacity-40 mix-blend-multiply`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90"></div>
            
            {/* Text Content */}
            <div className="absolute bottom-0 left-0 p-4">
              <h3 className="text-xl font-bold text-white font-kanit drop-shadow-md tracking-wide">{banner.title}</h3>
              <p className="text-sm text-white/90 font-kanit drop-shadow-sm font-medium">{banner.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};