import React, { createContext, useContext, useState, useEffect } from 'react';
import { Banner } from '../types';

interface BannerContextType {
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, updated: Partial<Banner>) => void;
  toggleBannerStatus: (id: string) => void;
  deleteBanner: (id: string) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

const INITIAL_BANNERS: Banner[] = [
  // 1. Tira Horizontal de Gran Impacto (Hero Strip Carrusel)
  {
    id: 'ban-hero-1',
    title: 'TEMPORADA DE AHORRO: DETERGENTES & QUÍMICOS',
    subtitle: 'Detergentes enzimáticos concentrados, blanqueadores oxigenados y suavizantes aroma lavanda a precio de fábrica',
    badge: 'MAYOREO INDUSTRIAL & HOTELERÍA',
    discount_tag: 'HASTA 35% DE DESCUENTO',
    image_url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=1200&auto=format&fit=crop&q=80',
    category_target: 'Detergentes & Químicos',
    position: 'STRIP_BANNER',
    background_color: '#580f36',
    is_active: true,
    order: 1,
  },
  {
    id: 'ban-hero-2',
    title: 'ESPECIAL TINTORERÍA: SOLVENTES & DESMANCHADORES EN SECO',
    subtitle: 'Percloroetileno puro 25L, desengrasantes de cuellos y quitamanchas de tinta y grasa pesada certificados',
    badge: 'GRADO PURO CERTIFICADO',
    discount_tag: 'HASTA 25% DE AHORRO',
    image_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1200&auto=format&fit=crop&q=80',
    category_target: 'Desmanchadores & Solventes Secos',
    position: 'STRIP_BANNER',
    background_color: '#45092a',
    is_active: true,
    order: 2,
  },
  {
    id: 'ban-hero-3',
    title: 'SUMINISTROS DE MOSTRADOR: EMPAQUE, GANCHOS & PLANCHADO',
    subtitle: 'Ganchos calibre 13, rollos de polietileno tubular 1000m y zapatas de teflón antibrillo para entrega impecable',
    badge: 'DESPACHO & MOSTRADOR',
    discount_tag: 'PRECIOS ESPECIALES POR CAJA',
    image_url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=1200&auto=format&fit=crop&q=80',
    category_target: 'Empaque & Ganchos',
    position: 'STRIP_BANNER',
    background_color: '#380621',
    is_active: true,
    order: 3,
  },

  // 2. Trío de "Promociones Irresistibles"
  {
    id: 'ban-flash-1',
    title: 'INSUMOS DE MOSTRADOR MENOS DE $499',
    subtitle: 'Cintas de marcaje inalterable, ganchos galvanizados y bolsas cubrepolvo',
    badge: 'PRECIO BAJO',
    discount_tag: '< $499 MXN',
    image_url: '',
    category_target: 'Empaque & Ganchos',
    position: 'FLASH_OFFER',
    background_color: '#f8fafc',
    is_active: true,
    order: 1,
  },
  {
    id: 'ban-flash-2',
    title: 'SUAVIZANTE 20L DE REGALO',
    subtitle: 'En la compra de 2 bidones de detergente enzimático biodegradable',
    badge: 'COMBO ESPECIAL',
    discount_tag: 'GRATIS',
    image_url: '',
    category_target: 'Suavizantes & Neutralizantes',
    position: 'FLASH_OFFER',
    background_color: '#580f36',
    is_active: true,
    order: 2,
  },
  {
    id: 'ban-flash-3',
    title: 'ZAPATAS DE TEFLÓN ¡SE ACABAN!',
    subtitle: 'Refacciones para planchas de vapor con descuento directo en caja',
    badge: 'ÚLTIMAS PIEZAS',
    discount_tag: '¡REMATE!',
    image_url: '',
    category_target: 'Refacciones & Planchado',
    position: 'FLASH_OFFER',
    background_color: '#f8fafc',
    is_active: true,
    order: 3,
  },

  // 3. Mosaico de Departamentos con Descuentos
  {
    id: 'ban-mosaic-1',
    title: 'DETERGENTES & QUÍMICOS INDUSTRIALES',
    subtitle: 'Enzimáticos concentrados, alcalinos y desengrasantes textiles',
    badge: 'ALTO RENDIMIENTO',
    discount_tag: 'HASTA 25% DE AHORRO',
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=70',
    category_target: 'Detergentes & Químicos',
    position: 'MOSAIC_PROMO',
    is_active: true,
    order: 1,
  },
  {
    id: 'ban-mosaic-2',
    title: 'SOLVENTES PARA LIMPIEZA EN SECO',
    subtitle: 'Percloroetileno e hidrocarburos certificados grado tintorería',
    badge: 'TINTORERÍA PRO',
    discount_tag: 'GRADO PURO',
    image_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&auto=format&fit=crop&q=70',
    category_target: 'Desmanchadores & Solventes Secos',
    position: 'MOSAIC_PROMO',
    is_active: true,
    order: 2,
  },
  {
    id: 'ban-mosaic-3',
    title: 'EMPAQUE, BOLSAS & GANCHOS',
    subtitle: 'Rollos de polietileno tubular, ganchos de alambre y portatrajes',
    badge: 'SUMINISTROS CLAVE',
    discount_tag: 'HASTA 30% DE AHORRO',
    image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=70',
    category_target: 'Empaque & Ganchos',
    position: 'MOSAIC_PROMO',
    is_active: true,
    order: 3,
  },
  {
    id: 'ban-mosaic-4',
    title: 'REFACCIONES & PRENSAS DE VAPOR',
    subtitle: 'Zapatas de teflón antibrillo, fundas de silicona y válvulas de caldera',
    badge: 'MANTENIMIENTO',
    discount_tag: 'HASTA 20% OFF',
    image_url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&auto=format&fit=crop&q=70',
    category_target: 'Refacciones & Planchado',
    position: 'MOSAIC_PROMO',
    is_active: true,
    order: 4,
  },
  {
    id: 'ban-mosaic-5',
    title: 'SUAVIZANTES & NEUTRALIZANTES',
    subtitle: 'Aromas florales de larga fijación y eliminadores de dureza de agua',
    badge: 'AROMA DURADERO',
    discount_tag: 'HASTA 20% DE AHORRO',
    image_url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=70',
    category_target: 'Suavizantes & Neutralizantes',
    position: 'MOSAIC_PROMO',
    is_active: true,
    order: 5,
  },
];

export const BannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>(() => {
    const saved = localStorage.getItem('pos_banners_v3');
    return saved ? JSON.parse(saved) : INITIAL_BANNERS;
  });

  useEffect(() => {
    localStorage.setItem('pos_banners_v3', JSON.stringify(banners));
  }, [banners]);

  const addBanner = (bannerData: Omit<Banner, 'id'>) => {
    const newBanner: Banner = {
      ...bannerData,
      id: `ban-${Date.now()}`,
    };
    setBanners((prev) => [newBanner, ...prev]);
  };

  const updateBanner = (id: string, updated: Partial<Banner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const toggleBannerStatus = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b))
    );
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BannerContext.Provider
      value={{
        banners,
        addBanner,
        updateBanner,
        toggleBannerStatus,
        deleteBanner,
      }}
    >
      {children}
    </BannerContext.Provider>
  );
};

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (!context) throw new Error('useBanners debe ser utilizado dentro de un BannerProvider');
  return context;
};

