import React, { useState, useEffect } from 'react';
import { Product, Banner } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useBanners } from '../../context/BannerContext';
import {
  Search,
  ShoppingBag,
  Check,
  ShieldCheck,
  ArrowRight,
  LogIn,
  LayoutDashboard,
  User,
  LogOut,
  MapPin,
  Truck,
  PhoneCall,
  Menu,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Percent,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  Package,
  Wrench,
  Calculator,
  FileText,
  Headphones,
  CreditCard,
  Banknote,
  Flame,
  Tag,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Catálogo ampliado y organizado por departamentos al estilo Home Depot México
// Catálogo especializado en productos, insumos y químicos para Lavanderías & Tintorerías
const LAUNDRY_CATALOG: (Product & { brand: string; rating: number; reviews: number })[] = [
  {
    id: 'p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01',
    name: 'Detergente Enzimático Concentrado 20L (Biodegradable)',
    description: 'Fórmula industrial con proteasas y amilasas. Remueve grasa pesada, sangre y almidón en mantelería, uniformes y ropa hospitalaria.',
    category: 'Detergentes & Químicos',
    brand: 'Ecolab ProTextil',
    price: 680.0,
    cost: 420.0,
    stock: 45,
    reserved_stock: 4,
    in_transit_stock: 20,
    safety_stock: 10,
    min_stock: 15,
    max_stock: 100,
    lead_time_days: 2,
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 142,
  },
  {
    id: 'p2',
    sku: 'LAV-SUAV-02',
    qr_code: 'QR-LAV-SUAV-02',
    name: 'Suavizante Textil Concentrado Aroma Lavanda Francesa 20L',
    description: 'Microcápsulas de fragancia de liberación prolongada con agentes antiestáticos que facilitan el calandrado y planchado.',
    category: 'Suavizantes & Neutralizantes',
    brand: 'AquaSoft Industrial',
    price: 540.0,
    cost: 310.0,
    stock: 35,
    reserved_stock: 2,
    in_transit_stock: 15,
    safety_stock: 8,
    min_stock: 12,
    max_stock: 80,
    lead_time_days: 3,
    image_url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.8,
    reviews: 98,
  },
  {
    id: 'p3',
    sku: 'TINT-SOLV-03',
    qr_code: 'QR-TINT-SOLV-03',
    name: 'Solvente para Limpieza en Seco Percloroetileno Grado Puro 25L',
    description: 'Disolvente de alta pureza para máquinas de tintorería de ciclo cerrado. Máxima seguridad para trajes de lana, seda y prendas delicadas.',
    category: 'Desmanchadores & Solventes Secos',
    brand: 'DryClean Chem',
    price: 1450.0,
    cost: 980.0,
    stock: 18,
    reserved_stock: 1,
    in_transit_stock: 10,
    safety_stock: 5,
    min_stock: 8,
    max_stock: 40,
    lead_time_days: 5,
    image_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 64,
  },
  {
    id: 'p4',
    sku: 'EMP-GAN-04',
    qr_code: 'QR-EMP-GAN-04',
    name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    description: 'Ganchos de alambre electrogalvanizado para tintorería y lavandería. Resistencia reforzada para abrigos, trajes y pantalones pesados.',
    category: 'Empaque & Ganchos',
    brand: 'MetalForm Tintorería',
    price: 485.0,
    cost: 290.0,
    stock: 80,
    reserved_stock: 8,
    in_transit_stock: 50,
    safety_stock: 20,
    min_stock: 30,
    max_stock: 200,
    lead_time_days: 3,
    image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 215,
  },
  {
    id: 'p5',
    sku: 'EMP-POL-05',
    qr_code: 'QR-EMP-POL-05',
    name: 'Rollo Polietileno Tubular Transparente Cubre Ropa 1000m',
    description: 'Fuelle lateral continuo de 60cm de ancho, calibre 60. Acabado cristal de alta transparencia para protección de entrega en mostrador.',
    category: 'Empaque & Ganchos',
    brand: 'PoliPack Express',
    price: 890.0,
    cost: 560.0,
    stock: 50,
    reserved_stock: 5,
    in_transit_stock: 25,
    safety_stock: 12,
    min_stock: 20,
    max_stock: 120,
    lead_time_days: 4,
    image_url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.8,
    reviews: 130,
  },
  {
    id: 'p6',
    sku: 'DESM-GRAS-06',
    qr_code: 'QR-DESM-GRAS-06',
    name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
    description: 'Acción penetrante para pre-desmanchado en seco y húmedo. Disuelve al instante residuos sebáceos y cosméticos sin decolorar la tela.',
    category: 'Desmanchadores & Solventes Secos',
    brand: 'Ecolab ProTextil',
    price: 420.0,
    cost: 240.0,
    stock: 28,
    reserved_stock: 3,
    in_transit_stock: 10,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 60,
    lead_time_days: 3,
    image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.7,
    reviews: 86,
  },
  {
    id: 'p7',
    sku: 'EQ-PLANC-07',
    qr_code: 'QR-EQ-PLANC-07',
    name: 'Zapata de Teflón Antibrillo para Plancha Industrial de Vapor',
    description: 'Lámina de aluminio con teflón virgen antiadherente. Distribuye el vapor homogéneo, evita brillos en casimires oscuros y marcas de quemadura.',
    category: 'Refacciones & Planchado',
    brand: 'SilverStar Pro',
    price: 320.0,
    cost: 180.0,
    stock: 22,
    reserved_stock: 0,
    in_transit_stock: 15,
    safety_stock: 5,
    min_stock: 8,
    max_stock: 40,
    lead_time_days: 4,
    image_url: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 77,
  },
  {
    id: 'p8',
    sku: 'EQ-PRENS-08',
    qr_code: 'QR-EQ-PRENS-08',
    name: 'Funda Térmica y Almohadilla de Silicona para Prensa Tintorería',
    description: 'Acolchado de máxima recuperación y resistencia térmica a 220°C con resortes perimetrales de acero para ajuste firme a prensas utilitarias.',
    category: 'Refacciones & Planchado',
    brand: 'SilverStar Pro',
    price: 780.0,
    cost: 460.0,
    stock: 14,
    reserved_stock: 1,
    in_transit_stock: 5,
    safety_stock: 3,
    min_stock: 5,
    max_stock: 25,
    lead_time_days: 5,
    image_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.6,
    reviews: 42,
  },
  {
    id: 'p9',
    sku: 'EMP-CINT-09',
    qr_code: 'QR-EMP-CINT-09',
    name: 'Cintas de Marcaje Textil Inalterable para Tintorería (10 Rollos)',
    description: 'Papel hidroresistente termoestampable que no se desintegra en lavados acuosos agresivos ni con disolventes en seco.',
    category: 'Empaque & Ganchos',
    brand: 'PoliPack Express',
    price: 290.0,
    cost: 160.0,
    stock: 65,
    reserved_stock: 4,
    in_transit_stock: 30,
    safety_stock: 15,
    min_stock: 20,
    max_stock: 150,
    lead_time_days: 2,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.8,
    reviews: 95,
  },
  {
    id: 'p10',
    sku: 'LAV-OXI-10',
    qr_code: 'QR-LAV-OXI-10',
    name: 'Blanqueador Oxigenado Textil en Polvo Saco 25kg (Color Seguro)',
    description: 'Percarbonato de sodio microencapsulado. Libera oxígeno activo desmanchando ropa blanca y de color sin desgastar las costuras.',
    category: 'Detergentes & Químicos',
    brand: 'Ecolab ProTextil',
    price: 950.0,
    cost: 590.0,
    stock: 40,
    reserved_stock: 6,
    in_transit_stock: 20,
    safety_stock: 10,
    min_stock: 15,
    max_stock: 100,
    lead_time_days: 3,
    image_url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 184,
  },
  {
    id: 'p11',
    sku: 'LAV-NEUT-11',
    qr_code: 'QR-LAV-NEUT-11',
    name: 'Neutralizante Anticalcáreo & Antiamarilleo Textil 10L',
    description: 'Regula el pH ácido en el último enjuague. Neutraliza el cloro residual, evita el amarillamiento de sábanas y toallas y prolonga la vida útil de las prendas.',
    category: 'Suavizantes & Neutralizantes',
    brand: 'AquaSoft Industrial',
    price: 390.0,
    cost: 220.0,
    stock: 25,
    reserved_stock: 2,
    in_transit_stock: 10,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 50,
    lead_time_days: 4,
    image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.7,
    reviews: 58,
  },
  {
    id: 'p12',
    sku: 'SERV-TINT-12',
    qr_code: 'QR-SERV-TINT-12',
    name: 'Servicio Tintorería Especializada Traje Completo 2 Piezas',
    description: 'Proceso artesanal de desmanchado en seco con percloroetileno, desodorizado, prensado con vapor caliente y entrega con gancho y polietileno.',
    category: 'Servicios & Planchaduría',
    brand: 'LavaClean Express',
    price: 160.0,
    cost: 45.0,
    stock: 99,
    reserved_stock: 5,
    in_transit_stock: 0,
    safety_stock: 20,
    min_stock: 20,
    max_stock: 200,
    lead_time_days: 1,
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 310,
  },
];

// Tarjetas interactivas de insumos 100% dedicadas al negocio de Lavandería & Tintorería
const HERO_SHOWCASE_CARDS: Record<number, Array<{
  name: string;
  category: string;
  image: string;
  tag: string;
}>> = {
  0: [
    {
      name: 'Detergente Enzimático',
      category: 'Detergentes & Químicos',
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300&auto=format&fit=crop&q=80',
      tag: 'Bidón 20L Industrial',
    },
    {
      name: 'Suavizante Aroma Lavanda',
      category: 'Suavizantes & Neutralizantes',
      image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=300&auto=format&fit=crop&q=80',
      tag: 'Concentrado 20L',
    },
    {
      name: 'Blanqueador Oxigenado',
      category: 'Detergentes & Químicos',
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80',
      tag: 'Saco 25kg Polvo',
    },
    {
      name: 'Neutralizante Textil',
      category: 'Suavizantes & Neutralizantes',
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300&auto=format&fit=crop&q=80',
      tag: 'Garrafa 10L',
    },
  ],
  1: [
    {
      name: 'Solvente en Seco Puro',
      category: 'Desmanchadores & Solventes Secos',
      image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=300&auto=format&fit=crop&q=80',
      tag: 'Percloroetileno 25L',
    },
    {
      name: 'Quitamanchas Grasa & Cuellos',
      category: 'Desmanchadores & Solventes Secos',
      image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=300&auto=format&fit=crop&q=80',
      tag: 'Envase 5L Tintorería',
    },
    {
      name: 'Cintas de Marcaje Textil',
      category: 'Empaque & Ganchos',
      image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&auto=format&fit=crop&q=80',
      tag: 'Pack 10 Rollos',
    },
    {
      name: 'Desengrasante Textil Tintorería',
      category: 'Desmanchadores & Solventes Secos',
      image: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=300&auto=format&fit=crop&q=80',
      tag: 'Acción Rápida',
    },
  ],
  2: [
    {
      name: 'Ganchos Galvanizados',
      category: 'Empaque & Ganchos',
      image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=300&auto=format&fit=crop&q=80',
      tag: 'Calibre 13 (Caja 500)',
    },
    {
      name: 'Rollo Polietileno Tubular',
      category: 'Empaque & Ganchos',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
      tag: '1000m Cubrerropa',
    },
    {
      name: 'Zapata de Teflón Antibrillo',
      category: 'Refacciones & Planchado',
      image: 'https://images.unsplash.com/photo-1584265557255-7d002492c23a?w=300&auto=format&fit=crop&q=80',
      tag: 'Plancha Vapor Industrial',
    },
    {
      name: 'Funda Térmica de Silicona',
      category: 'Refacciones & Planchado',
      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&auto=format&fit=crop&q=80',
      tag: 'Prensa de Tintorería',
    },
  ],
};

// ========================================================
// PROMOCIONES IRRESISTIBLES: PRODUCTOS DE LOS 3 CARRUSELES
// ========================================================

// Carrusel 1: Productos destacados con precio menor a $999 MXN
const PROMO_UNDER_999 = [
  {
    id: 'p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01',
    name: 'Detergente Enzimático Concentrado 20L (Biodegradable)',
    description: 'Fórmula industrial con proteasas y amilasas. Remueve grasa pesada, sangre y almidón en mantelería, uniformes y ropa hospitalaria.',
    category: 'Detergentes & Químicos',
    brand: 'Ecolab ProTextil',
    price: 680.0,
    cost: 420.0,
    stock: 45,
    reserved_stock: 4,
    in_transit_stock: 20,
    safety_stock: 10,
    min_stock: 15,
    max_stock: 100,
    lead_time_days: 2,
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 142,
    promoBadge: 'TOP VENTAS',
    savingsTag: 'Precio de Fábrica',
  },
  {
    id: 'p4',
    sku: 'EMP-GAN-04',
    qr_code: 'QR-EMP-GAN-04',
    name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    description: 'Ganchos de alambre electrogalvanizado para tintorería y lavandería. Resistencia reforzada para abrigos, trajes y pantalones pesados.',
    category: 'Empaque & Ganchos',
    brand: 'MetalForm Tintorería',
    price: 485.0,
    cost: 290.0,
    stock: 80,
    reserved_stock: 8,
    in_transit_stock: 50,
    safety_stock: 20,
    min_stock: 30,
    max_stock: 200,
    lead_time_days: 3,
    image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 215,
    promoBadge: '500 PIEZAS',
    savingsTag: 'Calibre 13 Reforzado',
  },
  {
    id: 'p6',
    sku: 'DESM-GRAS-06',
    qr_code: 'QR-DESM-GRAS-06',
    name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
    description: 'Acción penetrante para pre-desmanchado en seco y húmedo. Disuelve al instante residuos sebáceos y cosméticos sin decolorar la tela.',
    category: 'Desmanchadores & Solventes Secos',
    brand: 'Ecolab ProTextil',
    price: 420.0,
    cost: 240.0,
    stock: 28,
    reserved_stock: 3,
    in_transit_stock: 10,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 60,
    lead_time_days: 3,
    image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.7,
    reviews: 86,
    promoBadge: 'DESMANCHADOR',
    savingsTag: 'Garrafa 5L',
  },
  {
    id: 'p7',
    sku: 'EQ-PLANC-07',
    qr_code: 'QR-EQ-PLANC-07',
    name: 'Zapata de Teflón Antibrillo para Plancha Industrial de Vapor',
    description: 'Lámina de aluminio con teflón virgen antiadherente. Distribuye el vapor homogéneo, evita brillos en casimires oscuros y marcas de quemadura.',
    category: 'Refacciones & Planchado',
    brand: 'SilverStar Pro',
    price: 320.0,
    cost: 180.0,
    stock: 22,
    reserved_stock: 0,
    in_transit_stock: 15,
    safety_stock: 5,
    min_stock: 8,
    max_stock: 40,
    lead_time_days: 4,
    image_url: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 77,
    promoBadge: 'ANTIBRILLO',
    savingsTag: 'Teflón Virgen',
  },
  {
    id: 'p2',
    sku: 'LAV-SUAV-02',
    qr_code: 'QR-LAV-SUAV-02',
    name: 'Suavizante Textil Concentrado Aroma Lavanda Francesa 20L',
    description: 'Microcápsulas de fragancia de liberación prolongada con agentes antiestáticos que facilitan el calandrado y planchado.',
    category: 'Suavizantes & Neutralizantes',
    brand: 'AquaSoft Industrial',
    price: 540.0,
    cost: 310.0,
    stock: 35,
    reserved_stock: 2,
    in_transit_stock: 15,
    safety_stock: 8,
    min_stock: 12,
    max_stock: 80,
    lead_time_days: 3,
    image_url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.8,
    reviews: 98,
    promoBadge: 'CONCENTRADO',
    savingsTag: 'Bidón 20L',
  },
  {
    id: 'p9',
    sku: 'EMP-CINT-09',
    qr_code: 'QR-EMP-CINT-09',
    name: 'Cintas de Marcaje Textil Inalterable para Tintorería (10 Rollos)',
    description: 'Papel hidroresistente termoestampable que no se desintegra en lavados acuosos agresivos ni con disolventes en seco.',
    category: 'Empaque & Ganchos',
    brand: 'PoliPack Express',
    price: 290.0,
    cost: 160.0,
    stock: 65,
    reserved_stock: 4,
    in_transit_stock: 30,
    safety_stock: 15,
    min_stock: 20,
    max_stock: 150,
    lead_time_days: 2,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.8,
    reviews: 95,
    promoBadge: '10 ROLLOS',
    savingsTag: 'Hidroresistente',
  },
];

// Carrusel 2: Combos especiales con Producto de Regalo / Gratis
const PROMO_COMBOS_DATA = [
  {
    id: 'combo-1',
    sku: 'COMBO-LAV-01',
    qr_code: 'QR-COMBO-LAV-01',
    name: 'Combo Lavado: 2x Detergente 20L + 1x Suavizante 20L GRATIS',
    description: 'Paquete industrial: adquiere 2 bidones de Detergente Enzimático 20L y llévate completamente GRATIS 1 Suavizante Textil Aroma Lavanda 20L.',
    category: 'Detergentes & Químicos',
    brand: 'Ecolab & AquaSoft',
    price: 1360.0,
    cost: 840.0,
    stock: 25,
    reserved_stock: 0,
    in_transit_stock: 10,
    safety_stock: 5,
    min_stock: 5,
    max_stock: 50,
    lead_time_days: 2,
    image_url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 5.0,
    reviews: 48,
    originalPrice: 1900.0,
    freeItemName: '¡Suavizante 20L GRATIS ($540 valor)!',
    savings: 540.0,
    promoBadge: 'PRODUCTO GRATIS',
  },
  {
    id: 'combo-2',
    sku: 'COMBO-TINT-02',
    qr_code: 'QR-COMBO-TINT-02',
    name: 'Kit Maestro Tintorería: Solvente 25L + Quitamanchas 5L GRATIS',
    description: '1 Solvente Percloroetileno Puro 25L y recibe de regalo un Quitamanchas Profesional para Grasa & Cuellos 5L.',
    category: 'Desmanchadores & Solventes Secos',
    brand: 'DryClean Chem',
    price: 1450.0,
    cost: 980.0,
    stock: 15,
    reserved_stock: 0,
    in_transit_stock: 5,
    safety_stock: 3,
    min_stock: 3,
    max_stock: 30,
    lead_time_days: 3,
    image_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 36,
    originalPrice: 1870.0,
    freeItemName: '¡Quitamanchas 5L GRATIS ($420 valor)!',
    savings: 420.0,
    promoBadge: 'PRODUCTO GRATIS',
  },
  {
    id: 'combo-3',
    sku: 'COMBO-EMP-03',
    qr_code: 'QR-COMBO-EMP-03',
    name: 'Pack Mostrador: 2x Cajas Ganchos (1000 pz) + Cintas Marcaje GRATIS',
    description: 'Dos cajas de Ganchos Calibre 13 (1,000 pzas totales) + 1 Pack de 10 rollos de cintas de marcaje hidroresistentes sin costo.',
    category: 'Empaque & Ganchos',
    brand: 'MetalForm & PoliPack',
    price: 970.0,
    cost: 580.0,
    stock: 30,
    reserved_stock: 1,
    in_transit_stock: 15,
    safety_stock: 5,
    min_stock: 5,
    max_stock: 60,
    lead_time_days: 2,
    image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 62,
    originalPrice: 1260.0,
    freeItemName: '¡10 Rollos Cintas GRATIS ($290 valor)!',
    savings: 290.0,
    promoBadge: 'PRODUCTO GRATIS',
  },
  {
    id: 'combo-4',
    sku: 'COMBO-PLANC-04',
    qr_code: 'QR-COMBO-PLANC-04',
    name: 'Dúo Planchaduría: Funda Silicona Prensa + Zapata Teflón GRATIS',
    description: 'Funda Térmica de Silicona para Prensa utilitaria y llévate de regalo una Zapata de Teflón Antibrillo para plancha industrial.',
    category: 'Refacciones & Planchado',
    brand: 'SilverStar Pro',
    price: 780.0,
    cost: 460.0,
    stock: 12,
    reserved_stock: 0,
    in_transit_stock: 5,
    safety_stock: 2,
    min_stock: 4,
    max_stock: 25,
    lead_time_days: 3,
    image_url: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.8,
    reviews: 29,
    originalPrice: 1100.0,
    freeItemName: '¡Zapata Teflón GRATIS ($320 valor)!',
    savings: 320.0,
    promoBadge: 'PRODUCTO GRATIS',
  },
];

// Carrusel 3: Compra Especial ¡Se Acaban! (Últimas piezas en existencia)
const PROMO_ENDING_SOON = [
  {
    id: 'p8',
    sku: 'EQ-PRENS-08',
    qr_code: 'QR-EQ-PRENS-08',
    name: 'Funda Térmica y Almohadilla de Silicona para Prensa Tintorería',
    description: 'Acolchado de máxima recuperación y resistencia térmica a 220°C con resortes perimetrales de acero para ajuste firme a prensas utilitarias.',
    category: 'Refacciones & Planchado',
    brand: 'SilverStar Pro',
    price: 780.0,
    cost: 460.0,
    stock: 14,
    reserved_stock: 1,
    in_transit_stock: 5,
    safety_stock: 3,
    min_stock: 5,
    max_stock: 25,
    lead_time_days: 5,
    image_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.6,
    reviews: 42,
    stockLeft: 14,
    urgencyText: '¡Solo 14 pzas!',
    stockPercent: 20,
  },
  {
    id: 'p3',
    sku: 'TINT-SOLV-03',
    qr_code: 'QR-TINT-SOLV-03',
    name: 'Solvente para Limpieza en Seco Percloroetileno Grado Puro 25L',
    description: 'Disolvente de alta pureza para máquinas de tintorería de ciclo cerrado. Máxima seguridad para trajes de lana, seda y prendas delicadas.',
    category: 'Desmanchadores & Solventes Secos',
    brand: 'DryClean Chem',
    price: 1450.0,
    cost: 980.0,
    stock: 18,
    reserved_stock: 1,
    in_transit_stock: 10,
    safety_stock: 5,
    min_stock: 8,
    max_stock: 40,
    lead_time_days: 5,
    image_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 64,
    stockLeft: 18,
    urgencyText: '¡Últimos 18 bidones!',
    stockPercent: 25,
  },
  {
    id: 'p7',
    sku: 'EQ-PLANC-07',
    qr_code: 'QR-EQ-PLANC-07',
    name: 'Zapata de Teflón Antibrillo para Plancha Industrial de Vapor',
    description: 'Lámina de aluminio con teflón virgen antiadherente. Distribuye el vapor homogéneo, evita brillos en casimires oscuros y marcas de quemadura.',
    category: 'Refacciones & Planchado',
    brand: 'SilverStar Pro',
    price: 320.0,
    cost: 180.0,
    stock: 22,
    reserved_stock: 0,
    in_transit_stock: 15,
    safety_stock: 5,
    min_stock: 8,
    max_stock: 40,
    lead_time_days: 4,
    image_url: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.9,
    reviews: 77,
    stockLeft: 22,
    urgencyText: '¡Solo 22 piezas!',
    stockPercent: 30,
  },
  {
    id: 'p11',
    sku: 'LAV-NEUT-11',
    qr_code: 'QR-LAV-NEUT-11',
    name: 'Neutralizante Anticalcáreo & Antiamarilleo Textil 10L',
    description: 'Regula el pH ácido en el último enjuague. Neutraliza el cloro residual, evita el amarillamiento de sábanas y toallas y prolonga la vida útil de las prendas.',
    category: 'Suavizantes & Neutralizantes',
    brand: 'AquaSoft Industrial',
    price: 390.0,
    cost: 220.0,
    stock: 25,
    reserved_stock: 2,
    in_transit_stock: 10,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 50,
    lead_time_days: 4,
    image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.7,
    reviews: 58,
    stockLeft: 25,
    urgencyText: '¡Últimas 25 garrafas!',
    stockPercent: 35,
  },
  {
    id: 'p6',
    sku: 'DESM-GRAS-06',
    qr_code: 'QR-DESM-GRAS-06',
    name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
    description: 'Acción penetrante para pre-desmanchado en seco y húmedo. Disuelve al instante residuos sebáceos y cosméticos sin decolorar la tela.',
    category: 'Desmanchadores & Solventes Secos',
    brand: 'Ecolab ProTextil',
    price: 420.0,
    cost: 240.0,
    stock: 28,
    reserved_stock: 3,
    in_transit_stock: 10,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 60,
    lead_time_days: 3,
    image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&auto=format&fit=crop&q=60',
    is_active: true,
    rating: 4.7,
    reviews: 86,
    stockLeft: 28,
    urgencyText: '¡28 piezas en piso!',
    stockPercent: 40,
  },
];

export const CatalogPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos los Departamentos');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(25000);
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState('Sucursal Matriz Centro');
  const { addItem, items, total } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { banners } = useBanners();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Estado del carrusel de ofertas
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroAutoPlaying, setIsHeroAutoPlaying] = useState(true);

  // Estados para los 3 mini-carruseles de Promociones Irresistibles
  const [slideUnder999, setSlideUnder999] = useState(0);
  const [slideCombos, setSlideCombos] = useState(0);
  const [slideEndingSoon, setSlideEndingSoon] = useState(0);
  const [isPromoAutoPlaying, setIsPromoAutoPlaying] = useState(true);

  // Auto-rotación de los carruseles de promociones cada 4.5 segundos
  useEffect(() => {
    if (!isPromoAutoPlaying) return;
    const interval = setInterval(() => {
      setSlideUnder999((prev) => (prev + 1) % PROMO_UNDER_999.length);
      setSlideCombos((prev) => (prev + 1) % PROMO_COMBOS_DATA.length);
      setSlideEndingSoon((prev) => (prev + 1) % PROMO_ENDING_SOON.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPromoAutoPlaying]);

  // Banners administrados dinámicamente desde el panel de Marketing
  const activeStripBanners = banners.filter((b) => b.is_active && b.position === 'STRIP_BANNER');
  const activeFlashBanners = banners.filter((b) => b.is_active && b.position === 'FLASH_OFFER');
  const activeMosaicBanners = banners.filter((b) => b.is_active && b.position === 'MOSAIC_PROMO');

  // Auto-rotación del carrusel cada 5.5 segundos
  useEffect(() => {
    if (!isHeroAutoPlaying || activeStripBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % activeStripBanners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHeroAutoPlaying, activeStripBanners.length]);

  const handlePrevHero = () => {
    setCurrentHeroSlide((prev) => (prev === 0 ? activeStripBanners.length - 1 : prev - 1));
  };

  const handleNextHero = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % activeStripBanners.length);
  };

  const categories = [
    'Todos los Departamentos',
    'Detergentes & Químicos',
    'Suavizantes & Neutralizantes',
    'Desmanchadores & Solventes Secos',
    'Empaque & Ganchos',
    'Refacciones & Planchado',
    'Servicios & Planchaduría',
  ];

  const brands = [
    'Todas',
    'Ecolab ProTextil',
    'AquaSoft Industrial',
    'DryClean Chem',
    'MetalForm Tintorería',
    'PoliPack Express',
    'SilverStar Pro',
    'LavaClean Express',
  ];

  const filtered = LAUNDRY_CATALOG.filter((p) => {
    const available = p.stock - p.reserved_stock;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Todos los Departamentos' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'Todas' || p.brand === selectedBrand;
    const matchesStock = !onlyInStock || available > 0;
    const matchesPrice = p.price <= maxPriceFilter;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock && matchesPrice;
  });

  const handleAddToCart = (p: Product) => {
    addItem(p, 1);
    setAddedItem(p.id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ======================================================== */}
      {/* 1. TOPBAR ESTILO HOME DEPOT (Información de Tienda y Ayuda) */}
      {/* ======================================================== */}
      <div className="bg-[#1f2937] text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Ubicación de Sucursal Física */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Mi Tienda: </span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent font-extrabold text-amber-400 cursor-pointer focus:outline-none"
              >
                <option value="Sucursal Centro" className="bg-slate-800 text-white">
                  Sucursal Centro (Abierto hoy 8am - 9pm)
                </option>
                <option value="Sucursal Norte" className="bg-slate-800 text-white">
                  Sucursal Norte Plaza (Horario 9am - 8pm)
                </option>
              </select>
            </div>
            <span className="hidden md:inline text-slate-500">|</span>
            <div className="hidden md:flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Entregas a domicilio en 24-48 hrs</span>
            </div>
          </div>

          {/* Soporte y Enlaces Secundarios */}
          <div className="flex items-center gap-4 text-slate-300">
            <span className="hidden sm:inline">
              Ventas y Cotizaciones: <strong>55-5555-0101</strong>
            </span>
            <Link
              to="/facturacion"
              className="text-white hover:text-pink-200 transition-colors font-bold underline decoration-pink-300/60 underline-offset-2 flex items-center gap-1 cursor-pointer"
              title="Portal de Auto-Facturación CFDI 4.0"
            >
              <FileText className="w-3.5 h-3.5 text-pink-300" />
              <span>Facturación en Línea</span>
            </Link>
            <span className="hidden md:inline">Ayuda</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. HEADER PRINCIPAL CON BUSCADOR GIGANTE Y BOTÓN LOGIN   */}
      {/* ======================================================== */}
      <header className="bg-[#580f36] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-8">
          {/* Fila Superior en Móvil: Logo y Accesos Rápidos */}
          <div className="flex items-center justify-between gap-3">
            {/* Logotipo Lavandería & Tintorería */}
            <Link to="/" className="flex items-center gap-2.5 font-black text-2xl tracking-tighter text-white shrink-0">
              <img src="/logo.svg" alt="LavaClean Pro Logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-md object-contain shrink-0" />
              <div className="leading-tight">
                <span className="block text-lg sm:text-xl font-black tracking-tight">
                  LAVA<span className="text-pink-200">CLEAN</span> PRO
                </span>
                <span className="block text-[8px] sm:text-[9px] tracking-widest text-pink-200 uppercase font-bold">
                  Insumos de Lavandería & Tintorería
                </span>
              </div>
            </Link>

            {/* Accesos Rápidos visibles sólo en móviles */}
            <div className="flex md:hidden items-center gap-2">
              {isAuthenticated && user ? (
                <Link
                  to={user.role === 'CAJERO' ? '/admin/cashier' : '/admin/counter-sale'}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold border border-white/20 transition-colors"
                  title="Ir al Panel"
                >
                  <User className="w-3.5 h-3.5 text-pink-200" />
                  <span className="text-[11px]">Panel</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-[#580f36] hover:bg-pink-50 rounded-lg text-xs font-black shadow-xs transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Entrar</span>
                </Link>
              )}

              {/* Carrito Móvil */}
              <div className="relative p-2 bg-white/10 rounded-lg text-white">
                <ShoppingBag className="w-4 h-4" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-300 text-slate-900 rounded-full font-black text-[9px] flex items-center justify-center shadow">
                    {items.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Megabuscador Central (Full Width en móviles, Centrado en Desktop) */}
          <div className="flex-1 w-full md:max-w-3xl relative">
            <form onSubmit={(e) => e.preventDefault()} className="relative flex">
              <input
                type="text"
                placeholder="¿Qué insumo necesitas? Busca por nombre, SKU o categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3.5 sm:pl-4 pr-11 py-2 sm:py-2.5 bg-white text-slate-800 rounded-lg text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-[#420b29] hover:bg-[#2d071c] text-white rounded-md flex items-center justify-center transition-colors"
                title="Buscar producto"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Acceso a Cuenta y Carrito en Desktop */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {isAuthenticated && user ? (
              <Link
                to={user.role === 'CAJERO' ? '/admin/cashier' : '/admin/counter-sale'}
                className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold border border-white/20 transition-colors shadow-2xs"
                title={`Conectado como ${user.full_name || user.email} (${user.role}) - Clic para ir al Panel`}
              >
                <User className="w-4 h-4 text-pink-200 shrink-0" />
                <span className="hidden md:inline max-w-[200px] truncate">
                  {user.full_name ? user.full_name.split(' (')[0] : user.email}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-3.5 py-2 bg-white text-[#580f36] hover:bg-pink-50 rounded-lg text-xs font-black shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </Link>
            )}

            {/* Carrito de Compras */}
            <div className="relative flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="relative p-2 bg-white/10 hover:bg-white/15 rounded-lg text-white">
                <ShoppingBag className="w-5 h-5" />
                {items.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-pink-300 text-slate-900 rounded-full font-black text-[10px] flex items-center justify-center shadow">
                    {items.length}
                  </span>
                )}
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <span className="text-[10px] text-pink-200 block uppercase font-bold">Pedido</span>
                <span className="font-extrabold text-white text-sm">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. BARRA SECUNDARIA EJECUTIVA: INFORMACIÓN & SERVICIO B2B */}
      {/* ======================================================== */}
      <nav className="bg-[#420b29] text-white text-xs font-semibold shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2">
          {/* Lado izquierdo: indicador de sucursal y entrega */}
          <div className="flex items-center gap-4 text-pink-100/90 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Package className="w-3.5 h-3.5 text-pink-300" />
              <span>Catálogo Mayorista de Insumos & Tintorería</span>
            </div>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="hidden sm:inline text-pink-200/80 text-[11px]">
              Venta de mostrador y despacho directo a todo México
            </span>
          </div>

          {/* Lado derecho: Precios especiales y cotizaciones */}
          <div className="flex items-center gap-4 text-xs">
            <Link
              to="/login"
              className="hidden md:flex items-center gap-1.5 text-pink-200 hover:text-white transition-colors font-bold"
            >
              <Percent className="w-3.5 h-3.5 text-pink-300" />
              <span>Precios Especiales para Tintorerías, Lavanderías & Hoteles</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 4. CARRUSEL HERO DE OFERTAS: INSUMOS DE LAVANDERÍA & TINTORERÍA */}
      {/* ======================================================== */}
      {activeStripBanners.length > 0 && (() => {
        const hero = activeStripBanners[currentHeroSlide % activeStripBanners.length] || activeStripBanners[0];
        const showcaseCards = HERO_SHOWCASE_CARDS[currentHeroSlide % 3] || HERO_SHOWCASE_CARDS[0];

        return (
          <div
            onMouseEnter={() => setIsHeroAutoPlaying(false)}
            onMouseLeave={() => setIsHeroAutoPlaying(true)}
            style={{ backgroundColor: hero.background_color || '#580f36' }}
            className="text-white relative overflow-hidden shadow-sm border-b-4 border-black/20 transition-all duration-700 select-none"
          >
            {/* Controles de Navegación del Carrusel (Flechas Izq / Der) */}
            {activeStripBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevHero}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-md active:scale-95"
                  title="Oferta anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextHero}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-md active:scale-95"
                  title="Siguiente oferta"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="max-w-7xl mx-auto px-10 sm:px-14 lg:px-16 py-5 sm:py-7 flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Bloque Izquierdo de Oferta */}
              <div className="space-y-3 text-center lg:text-left z-10 shrink-0 max-w-xl">
                <div className="inline-block bg-black/90 px-3 py-1 rounded-sm shadow-md border border-white/10">
                  <span className="text-[11px] font-black tracking-widest text-white uppercase block">
                    {hero.badge || 'TEMPORADA DEL AHORRO'}
                  </span>
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                    ¡OFERTAS EXCLUSIVAS DE FÁBRICA!
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white drop-shadow-md leading-none">
                    {hero.discount_tag || 'HASTA 35% DE DESCUENTO'}
                  </h2>
                  <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-amber-100/90 leading-snug">
                    {hero.subtitle || 'Detergentes enzimáticos, solventes en seco y ganchos de alta resistencia a precio de fábrica'}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-center lg:justify-start gap-3">
                  <button
                    onClick={() => {
                      if (hero.category_target) setSelectedCategory(hero.category_target);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#580f36] hover:bg-pink-100 font-black text-xs uppercase tracking-wider rounded-md shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>COMPRAR AHORA</span>
                    <ShoppingBag className="w-4 h-4 text-[#580f36]" />
                  </button>
                  <span className="text-[11px] text-pink-100/80 font-semibold hidden sm:inline">
                    Vigencia por tiempo limitado o agotar existencias
                  </span>
                </div>
              </div>

              {/* Bloque Derecho: Galería Carrusel con Imágenes 100% Dedicadas a Lavandería & Tintorería */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 z-10 w-full lg:w-auto">
                {showcaseCards.map((card, cIdx) => (
                  <div
                    key={cIdx}
                    onClick={() => setSelectedCategory(card.category)}
                    className="bg-black/40 hover:bg-black/60 p-3 rounded-xl flex flex-col items-center justify-between border border-white/15 shadow-inner group hover:scale-105 hover:border-pink-300 transition-all cursor-pointer w-full sm:w-28 h-36"
                    title={`Ver departamento: ${card.category}`}
                  >
                    <div className="h-20 w-full flex items-center justify-center overflow-hidden rounded-md bg-white/5 p-1">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="h-full w-full object-cover rounded filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-center mt-1 w-full">
                      <span className="text-[10px] font-bold text-white block truncate leading-tight">
                        {card.name}
                      </span>
                      <span className="text-[9px] font-semibold text-pink-200 block truncate">
                        {card.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicadores de diapositivas (Dots) en la parte inferior */}
            {activeStripBanners.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {activeStripBanners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentHeroSlide(idx)}
                    className={`transition-all rounded-full cursor-pointer ${
                      currentHeroSlide % activeStripBanners.length === idx
                        ? 'w-7 h-2 bg-pink-300 shadow-xs'
                        : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Ir a diapositiva ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* CONTENEDOR PRINCIPAL: PROMOCIONES, MOSAICO Y CATÁLOGO     */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-10 flex-1">
        {/* ======================================================== */}
        {/* 5. PROMOCIONES IRRESISTIBLES: 3 CARRUSELES INTERACTIVOS  */}
        {/* Exacto a las capturas: MENOS DE $999, PRODUCTO GRATIS, COMPRA ESPECIAL ¡SE ACABAN! */}
        {/* ======================================================== */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 pb-1.5 border-b-2 border-red-600 inline-block tracking-tight">
              ¡Promociones irresistibles!
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              Precios y combos exclusivos por tiempo limitado
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* ======================================================== */}
            {/* CARRUSEL 1: MENOS DE $999                                */}
            {/* ======================================================== */}
            <div
              onMouseEnter={() => setIsPromoAutoPlaying(false)}
              onMouseLeave={() => setIsPromoAutoPlaying(true)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 border-b-4 border-b-red-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Header idéntico a la captura */}
              <div className="bg-[#f8f9fa] border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-800 tracking-wider uppercase block leading-none">
                    MENOS DE
                  </span>
                  <span className="text-3xl font-black text-red-600 tracking-tight block leading-none mt-1">
                    $999
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setSlideUnder999((prev) =>
                        prev === 0 ? PROMO_UNDER_999.length - 1 : prev - 1
                      )
                    }
                    className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                    title="Producto anterior (< $999)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setSlideUnder999((prev) => (prev + 1) % PROMO_UNDER_999.length)
                    }
                    className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                    title="Siguiente producto (< $999)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contenido del Producto en el Carrusel */}
              {(() => {
                const item = PROMO_UNDER_999[slideUnder999];
                return (
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 h-44 mb-3.5 group">
                        <img
                          src={item.image_url || ''}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          {item.promoBadge}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {item.savingsTag}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {item.brand} • {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
                        {item.name}
                      </h4>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-black text-red-600">
                          ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ${(item.price * 1.25).toFixed(2)}
                        </span>
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs">
                          -20% AHORRO
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                          addedItem === item.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white active:scale-98'
                        }`}
                      >
                        {addedItem === item.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>¡Agregado al Carrito!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Agregar al Carrito</span>
                          </>
                        )}
                      </button>

                      {/* Indicadores de diapositiva y link */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          {PROMO_UNDER_999.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSlideUnder999(idx)}
                              className={`transition-all rounded-full cursor-pointer ${
                                slideUnder999 === idx
                                  ? 'w-5 h-1.5 bg-red-600'
                                  : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                              }`}
                              title={`Ver insumo ${idx + 1}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setMaxPriceFilter(999);
                            setSelectedCategory('Todos los Departamentos');
                          }}
                          className="text-[11px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Ver más &lt; $999</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ======================================================== */}
            {/* CARRUSEL 2: PRODUCTO GRATIS (COMBOS ESPECIALES)          */}
            {/* ======================================================== */}
            <div
              onMouseEnter={() => setIsPromoAutoPlaying(false)}
              onMouseLeave={() => setIsPromoAutoPlaying(true)}
              className="bg-red-600 rounded-2xl overflow-hidden border border-red-700 border-b-4 border-b-red-800 shadow-md hover:shadow-lg transition-all flex flex-col justify-between text-white"
            >
              {/* Header idéntico a la captura */}
              <div className="bg-red-700/60 border-b border-red-500/40 px-5 py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black tracking-wider uppercase block text-red-100 leading-none">
                    PRODUCTO
                  </span>
                  <span className="text-3xl font-black text-white tracking-tight block leading-none mt-1">
                    GRATIS
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setSlideCombos((prev) =>
                        prev === 0 ? PROMO_COMBOS_DATA.length - 1 : prev - 1
                      )
                    }
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                    title="Combo anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setSlideCombos((prev) => (prev + 1) % PROMO_COMBOS_DATA.length)
                    }
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                    title="Siguiente combo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contenido del Combo en el Carrusel */}
              {(() => {
                const item = PROMO_COMBOS_DATA[slideCombos];
                return (
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="relative rounded-xl overflow-hidden bg-white border border-red-400/40 h-44 mb-3.5 group">
                        <img
                          src={item.image_url || ''}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-yellow-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-red-600 fill-red-600" />
                          <span>{item.promoBadge}</span>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-xs text-yellow-300 text-[10px] font-black px-2.5 py-1 rounded-md text-center border border-yellow-400/40 truncate">
                          {item.freeItemName}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-200 block mb-1">
                        {item.brand} • Paquete en Combo
                      </span>
                      <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
                        {item.name}
                      </h4>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-black text-white">
                          ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-red-200 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                        <span className="text-[11px] font-black text-slate-900 bg-yellow-400 px-1.5 py-0.5 rounded-xs shadow-2xs">
                          Ahorras ${item.savings}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-red-500/40">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                          addedItem === item.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white hover:bg-red-50 text-red-600 active:scale-98'
                        }`}
                      >
                        {addedItem === item.id ? (
                          <>
                            <Check className="w-4 h-4 text-white" />
                            <span>¡Combo Agregado!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Agregar Combo al Carrito</span>
                          </>
                        )}
                      </button>

                      {/* Indicadores de diapositiva y link */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          {PROMO_COMBOS_DATA.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSlideCombos(idx)}
                              className={`transition-all rounded-full cursor-pointer ${
                                slideCombos === idx
                                  ? 'w-5 h-1.5 bg-white'
                                  : 'w-1.5 h-1.5 bg-red-300 hover:bg-white/70'
                              }`}
                              title={`Ver combo ${idx + 1}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCategory('Todos los Departamentos');
                          }}
                          className="text-[11px] font-bold text-red-100 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Ver combos</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ======================================================== */}
            {/* CARRUSEL 3: COMPRA ESPECIAL ¡SE ACABAN! (ÚLTIMAS PIEZAS) */}
            {/* ======================================================== */}
            <div
              onMouseEnter={() => setIsPromoAutoPlaying(false)}
              onMouseLeave={() => setIsPromoAutoPlaying(true)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 border-b-4 border-b-red-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Header idéntico a la captura */}
              <div className="bg-[#f8f9fa] border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center -space-y-0.5">
                    <span className="bg-amber-400 text-slate-900 font-black text-[9px] px-2 py-0.5 tracking-wider uppercase rounded-xs shadow-2xs">
                      COMPRA
                    </span>
                    <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 tracking-wider uppercase transform -rotate-2 rounded-xs shadow-2xs">
                      ESPECIAL
                    </span>
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 tracking-tight block leading-tight">
                      ¡SE ACABAN!
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 block leading-none">
                      Últimas piezas en piso
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setSlideEndingSoon((prev) =>
                        prev === 0 ? PROMO_ENDING_SOON.length - 1 : prev - 1
                      )
                    }
                    className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                    title="Oferta anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setSlideEndingSoon((prev) => (prev + 1) % PROMO_ENDING_SOON.length)
                    }
                    className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                    title="Siguiente oferta"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contenido de la oferta que se acaba */}
              {(() => {
                const item = PROMO_ENDING_SOON[slideEndingSoon];
                return (
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 h-44 mb-3.5 group">
                        <img
                          src={item.image_url || ''}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-amber-500 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Flame className="w-3 h-3 text-red-600 fill-red-600 animate-pulse" />
                          <span>{item.urgencyText}</span>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-md">
                          <div className="flex items-center justify-between text-[9px] mb-1">
                            <span className="text-slate-300">Disponibilidad en piso:</span>
                            <span className="font-bold text-amber-300">{item.stockLeft} unidades</span>
                          </div>
                          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.stockPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {item.brand} • {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
                        {item.name}
                      </h4>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-black text-slate-900">
                          ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ${(item.price * 1.2).toFixed(2)}
                        </span>
                        <span className="text-[11px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded-xs">
                          ÚLTIMAS PIEZAS
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                          addedItem === item.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-black text-white active:scale-98'
                        }`}
                      >
                        {addedItem === item.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>¡Agregado al Carrito!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Aprovechar Oferta</span>
                          </>
                        )}
                      </button>

                      {/* Indicadores de diapositiva y link */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          {PROMO_ENDING_SOON.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSlideEndingSoon(idx)}
                              className={`transition-all rounded-full cursor-pointer ${
                                slideEndingSoon === idx
                                  ? 'w-5 h-1.5 bg-red-600'
                                  : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                              }`}
                              title={`Ver oferta ${idx + 1}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setOnlyInStock(true);
                            setSelectedCategory('Todos los Departamentos');
                          }}
                          className="text-[11px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Ver catálogo</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 6. MOSAICO DE DEPARTAMENTOS CON AHORRO (ESTILO HOME DEPOT) */}
        {/* Pisos (20%), Calefacción (Nuevo), Línea Blanca (50%), Calentadores (25%), Baños (30%) */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Mosaico 1: PISOS (Grande a la izquierda) */}
            <div
              onClick={() => setSelectedCategory('Materiales de Construcción')}
              className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group min-h-[300px] lg:min-h-[380px]"
            >
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80"
                alt="Pisos y Porcelanatos"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Badge Circular Rojo de Descuento */}
              <div className="absolute top-4 left-4 bg-red-600 text-white w-14 h-14 rounded-full flex flex-col items-center justify-center font-black text-center shadow-lg border-2 border-white leading-tight">
                <span className="text-[9px] uppercase">HASTA</span>
                <span className="text-sm font-black">20%</span>
                <span className="text-[8px] uppercase">AHORRO</span>
              </div>

              {/* Rótulo de Departamento */}
              <div className="absolute bottom-4 right-4 text-right">
                <h4 className="text-2xl font-black text-white tracking-wider uppercase drop-shadow-md">
                  PISOS<sup className="text-xs">&dagger;</sup>
                </h4>
                <p className="text-xs text-slate-200 font-semibold">Porcelanatos y cerámicos de alta resistencia</p>
              </div>
            </div>

            {/* Columna Derecha con 2 bloques apilados */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Mosaico 2: CALEFACCIÓN */}
              <div
                onClick={() => setSelectedCategory('Iluminación & Hogar')}
                className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group min-h-[180px] flex-1"
              >
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80"
                  alt="Calefacción y Chimeneas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-black text-[11px] uppercase tracking-wider shadow-lg border border-white">
                  NUEVO
                </div>

                <div className="absolute bottom-4 right-4 text-right">
                  <h4 className="text-xl font-black text-white tracking-wider uppercase drop-shadow-md">
                    CALEFACCIÓN<sup className="text-xs">&dagger;</sup>
                  </h4>
                  <p className="text-xs text-slate-200 font-semibold">Chimeneas eléctricas y calefactores</p>
                </div>
              </div>

              {/* Mosaico 3: LÍNEA BLANCA */}
              <div
                onClick={() => setSelectedCategory('Herramientas & Maquinaria')}
                className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group min-h-[180px] flex-1"
              >
                <img
                  src="https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80"
                  alt="Línea Blanca Whirlpool"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4 bg-red-600 text-white w-14 h-14 rounded-full flex flex-col items-center justify-center font-black text-center shadow-lg border-2 border-white leading-tight">
                  <span className="text-[9px] uppercase">HASTA</span>
                  <span className="text-sm font-black">50%</span>
                  <span className="text-[8px] uppercase">AHORRO</span>
                </div>

                <div className="absolute bottom-4 right-4 text-right">
                  <h4 className="text-xl font-black text-white tracking-wider uppercase drop-shadow-md">
                    LÍNEA BLANCA
                  </h4>
                  <p className="text-xs text-slate-200 font-semibold">Refrigeración inteligente y centros de lavado</p>
                </div>
              </div>
            </div>

            {/* Fila Inferior del Mosaico: Calentadores (Izq) y Baños (Der) */}
            {/* Mosaico 4: CALENTADORES */}
            <div
              onClick={() => setSelectedCategory('Plomería & Baños')}
              className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group min-h-[220px]"
            >
              <img
                src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80"
                alt="Calentadores de Agua"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="bg-red-600 text-white w-14 h-14 rounded-full flex flex-col items-center justify-center font-black text-center shadow-lg border-2 border-white leading-tight">
                  <span className="text-[9px] uppercase">HASTA</span>
                  <span className="text-sm font-black">25%</span>
                  <span className="text-[8px] uppercase">AHORRO</span>
                </div>
                <div className="bg-black/80 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 border border-white/20">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>INSTALACIÓN BÁSICA GRATIS&dagger;</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 text-right">
                <h4 className="text-xl font-black text-white tracking-wider uppercase drop-shadow-md">
                  CALENTADORES
                </h4>
                <p className="text-xs text-slate-200 font-semibold">Boilers de paso instantáneos y eléctricos</p>
              </div>
            </div>

            {/* Mosaico 5: BAÑOS */}
            <div
              onClick={() => setSelectedCategory('Plomería & Baños')}
              className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group min-h-[220px]"
            >
              <img
                src="https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&auto=format&fit=crop&q=80"
                alt="Muebles y Grifería de Baño"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-4 left-4 bg-red-600 text-white w-14 h-14 rounded-full flex flex-col items-center justify-center font-black text-center shadow-lg border-2 border-white leading-tight">
                <span className="text-[9px] uppercase">HASTA</span>
                <span className="text-sm font-black">30%</span>
                <span className="text-[8px] uppercase">AHORRO</span>
              </div>

              <div className="absolute bottom-4 right-4 text-right">
                <h4 className="text-xl font-black text-white tracking-wider uppercase drop-shadow-md">
                  BAÑOS<sup className="text-xs">&dagger;</sup>
                </h4>
                <p className="text-xs text-slate-200 font-semibold">Sanitarios ecológicos, canceles y grifería</p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 7. CUERPO PRINCIPAL: FILTROS FACETADOS + GRID PRODUCTOS  */}
        {/* ======================================================== */}
        <div className="pt-4">
          {/* Botón de Filtros Móvil / Tablet */}
          <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs mb-4">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="flex items-center gap-2 text-xs font-bold text-[#580f36] px-3.5 py-2 bg-pink-50 hover:bg-pink-100 rounded-xl border border-pink-200 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>
                {isMobileFiltersOpen ? 'Ocultar Filtros' : 'Filtrar Insumos'}
                {selectedCategory !== 'Todos los Departamentos' ? ` • ${selectedCategory}` : ''}
              </span>
            </button>
            <span className="text-xs text-slate-500 font-semibold">
              {filtered.length} productos
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* SIDEBAR DE FILTROS FACETADOS (IZQUIERDA) */}
            <aside className={`w-full lg:w-72 shrink-0 space-y-6 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#580f36]" />
                  <span>Filtrar Insumos</span>
                </h3>
                {(selectedCategory !== 'Todos los Departamentos' ||
                  selectedBrand !== 'Todas' ||
                  onlyInStock ||
                  maxPriceFilter < 25000) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('Todos los Departamentos');
                      setSelectedBrand('Todas');
                      setOnlyInStock(false);
                      setMaxPriceFilter(25000);
                    }}
                    className="text-[10px] text-[#580f36] hover:underline font-bold cursor-pointer"
                  >
                    Restablecer
                  </button>
                )}
              </div>

              {/* Filtro Principal: Departamentos / Categorías de Insumos */}
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2.5">
                  Departamentos de Insumos
                </span>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const count = cat === 'Todos los Departamentos'
                      ? LAUNDRY_CATALOG.length
                      : LAUNDRY_CATALOG.filter((p) => p.category === cat).length;
                    const isSelected = selectedCategory === cat;

                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#580f36] text-white font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-2">{cat}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtro: Disponibilidad Inmediata */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">Disponibilidad</span>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded text-[#580f36] focus:ring-[#580f36] accent-[#580f36] h-4 w-4 cursor-pointer"
                  />
                  <span>Sólo productos con stock disponible</span>
                </label>
              </div>

              {/* Filtro: Rango de Precio */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span className="uppercase tracking-wider">Precio Máximo:</span>
                  <span className="text-[#580f36] font-extrabold">${maxPriceFilter.toLocaleString()} MXN</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="25000"
                  step="50"
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  className="w-full accent-[#580f36] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>$20</span>
                  <span>$25,000+</span>
                </div>
              </div>

              {/* Filtro: Marcas Especializadas */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">Marcas Especializadas</span>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        selectedBrand === b
                          ? 'bg-pink-50 text-[#580f36] border border-pink-200/80 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{b}</span>
                      {selectedBrand === b && <Check className="w-3.5 h-3.5 text-[#580f36]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card B2B Especializada en Lavandería / Tintorería */}
              <div className="p-3.5 bg-pink-50/70 border border-pink-200/80 rounded-xl text-[#580f36] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-[#580f36]">
                  <FileText className="w-3.5 h-3.5 text-[#580f36] shrink-0" />
                  <span>¿Cotización por Mayoreo?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Genera tu presupuesto formal con reserva física garantizada de 48 horas en nuestro módulo de cotizaciones o mostrador.
                </p>
              </div>
            </div>
          </aside>

          {/* GRID DE PRODUCTOS (DERECHA) */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  {selectedCategory === 'Todos los Departamentos' ? 'Catálogo General de Insumos' : selectedCategory}
                </h3>
                <span className="text-xs text-slate-500 font-medium">({filtered.length} productos)</span>
              </div>

              <div className="text-xs text-slate-500">
                Mostrando stock de: <strong className="text-slate-800">{selectedBranch}</strong>
              </div>
            </div>

            {/* Chips de Filtros Activos para fácil navegación */}
            {(selectedCategory !== 'Todos los Departamentos' || selectedBrand !== 'Todas' || onlyInStock || maxPriceFilter < 25000) && (
              <div className="flex flex-wrap items-center gap-2 py-1">
                <span className="text-xs text-slate-400 font-medium">Filtros activos:</span>
                {selectedCategory !== 'Todos los Departamentos' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#580f36] text-white shadow-2xs">
                    <span>{selectedCategory}</span>
                    <button
                      onClick={() => setSelectedCategory('Todos los Departamentos')}
                      className="hover:text-pink-200 cursor-pointer font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedBrand !== 'Todas' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-white shadow-2xs">
                    <span>Marca: {selectedBrand}</span>
                    <button
                      onClick={() => setSelectedBrand('Todas')}
                      className="hover:text-pink-200 cursor-pointer font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
                {onlyInStock && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-700 text-white shadow-2xs">
                    <span>En stock</span>
                    <button
                      onClick={() => setOnlyInStock(false)}
                      className="hover:text-pink-200 cursor-pointer font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
                {maxPriceFilter < 25000 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                    <span>Máx: ${maxPriceFilter.toLocaleString()} MXN</span>
                    <button
                      onClick={() => setMaxPriceFilter(25000)}
                      className="hover:text-rose-600 cursor-pointer font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-extrabold text-slate-800 mb-1">No se encontraron productos</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Intenta cambiar tus filtros de búsqueda o seleccionar otro departamento.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('Todos los Departamentos');
                    setSelectedBrand('Todas');
                    setOnlyInStock(false);
                    setMaxPriceFilter(25000);
                  }}
                  className="px-4 py-2 bg-[#ea580c] text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product) => {
                  const available = product.stock - product.reserved_stock;
                  const inStock = available > 0;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Imagen y SKU */}
                      <div className="p-4 relative flex flex-col items-center">
                        <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                            SKU: #{product.sku}
                          </span>
                          <span className="text-slate-500 font-sans font-semibold">{product.brand}</span>
                        </div>

                        <div className="h-44 w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 my-2">
                          <img
                            src={product.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60'}
                            alt={product.name}
                            className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Rating simulado estilo Home Depot */}
                        <div className="w-full flex items-center gap-1.5 text-xs text-amber-500 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(product.rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-slate-600 text-[11px] font-bold">({product.reviews})</span>
                        </div>
                      </div>

                      {/* Información y Precio */}
                      <div className="p-4 pt-0 space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#ea580c] transition-colors line-clamp-2 leading-snug">
                            {product.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900">
                              ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-slate-500 font-bold">MXN</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Precio incluye IVA • Venta por unidad</p>
                        </div>

                        {/* Indicador de Disponibilidad en Sucursal */}
                        <div className="p-2 bg-slate-50 rounded-lg text-[11px] flex items-center justify-between border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="text-slate-600 font-medium">{selectedBranch}:</span>
                          </div>
                          <span className={`font-extrabold ${inStock ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {inStock ? `${available} en existencia` : 'Agotado'}
                          </span>
                        </div>

                        {/* Botón de Agregar al Carrito */}
                        <button
                          disabled={!inStock}
                          onClick={() => handleAddToCart(product)}
                          className={`w-full py-2.5 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs ${
                            addedItem === product.id
                              ? 'bg-emerald-600 text-white'
                              : inStock
                              ? 'bg-[#ea580c] hover:bg-[#c2410c] text-white active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {addedItem === product.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>¡Agregado al Carrito!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span>{inStock ? 'Agregar al Carrito' : 'Sin Existencia'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* ======================================================== */}
        {/* 8. JUNTOS HACEMOS TU PROYECTO (5 INDICADORES IDÉNTICOS)  */}
        {/* Exacto a la captura: Entrega en hogar, Instalación, Calculadora, Catálogo extendido, Chat */}
        {/* ======================================================== */}
        <section className="pt-8">
          <div className="mb-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 pb-1.5 border-b-2 border-orange-500 inline-block tracking-tight">
              Juntos hacemos tu proyecto
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Entrega en tu Hogar */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-2 border-t-orange-500 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                ENTREGA EN TU HOGAR
              </h4>
              <p className="text-[11px] text-slate-500">
                Llevamos tus productos hasta la puerta de tu hogar o directo en obra
              </p>
            </div>

            {/* Card 2: Servicio de Instalación */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-2 border-t-orange-500 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-3">
                <Wrench className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                SERVICIO DE INSTALACIÓN
              </h4>
              <p className="text-[11px] text-slate-500">
                ¡Déjanos ayudarte! Completa tu proyecto con técnicos profesionales
              </p>
            </div>

            {/* Card 3: Calculadora de Materiales */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-2 border-t-orange-500 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-3">
                <Calculator className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                CALCULADORA DE MATERIALES
              </h4>
              <p className="text-[11px] text-slate-500">
                Calcula los metros y presupuesto para pisos, tabique, pintura y mortero
              </p>
            </div>

            {/* Card 4: Catálogo Extendido */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-2 border-t-orange-500 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                CATÁLOGO EXTENDIDO
              </h4>
              <p className="text-[11px] text-slate-500">
                Encuentra más de 10,000 variedades de estilos, acabados y marcas
              </p>
            </div>

            {/* Card 5: Chat en Línea */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-t-2 border-t-orange-500 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-3">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                CHAT EN LÍNEA
              </h4>
              <p className="text-[11px] text-slate-500">
                Escríbenos por WhatsApp o portal web, ¡nuestros asesores están listos!
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 9. MÉTODOS DE PAGO (EXACTO A LA CAPTURA HOME DEPOT)       */}
        {/* ======================================================== */}
        <section className="pt-4">
          <div className="mb-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 pb-1.5 border-b-2 border-orange-500 inline-block tracking-tight">
              Métodos de pago
            </h3>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Opción 1: Tarjeta ProDepot / Banamex */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center min-h-[140px] shadow-xs hover:border-orange-500 transition-colors cursor-pointer group">
                <div className="w-16 h-10 bg-gradient-to-tr from-slate-700 to-slate-900 rounded-md p-1 shadow flex flex-col justify-between text-left text-white">
                  <div className="w-3 h-2 bg-amber-400 rounded-xs" />
                  <span className="text-[6px] font-mono tracking-widest">**** 8842</span>
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-orange-600 transition-colors mt-2">
                  Tarjeta de Crédito ProDepot Banamex &gt;
                </span>
              </div>

              {/* Opción 2: PayPal */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center min-h-[140px] shadow-xs hover:border-orange-500 transition-colors cursor-pointer group">
                <span className="text-2xl font-black italic text-blue-800 tracking-tighter">
                  Pay<span className="text-sky-500">Pal</span>
                </span>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-orange-600 transition-colors mt-2">
                  Pago a través de PayPal &gt;
                </span>
              </div>

              {/* Opción 3: Tarjetas de Crédito */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center min-h-[140px] shadow-xs hover:border-orange-500 transition-colors cursor-pointer group">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                  <span className="bg-blue-600 text-white px-1 py-0.5 rounded text-[9px] font-black italic">VISA</span>
                  <div className="flex -space-x-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-600 opacity-90" />
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 opacity-90" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-orange-600 transition-colors mt-2">
                  Tarjetas de Crédito &gt;
                </span>
              </div>

              {/* Opción 4: Débito y Vales */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center min-h-[140px] shadow-xs hover:border-orange-500 transition-colors cursor-pointer group">
                <div className="text-[10px] font-black text-slate-500 space-y-0.5">
                  <div className="bg-slate-100 px-1 rounded text-red-600 font-bold">Edenred • SíVale</div>
                  <div className="text-[9px] text-slate-600">Efectivale • Pluxee</div>
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-orange-600 transition-colors mt-2">
                  Tarjetas de Débito y Vales &gt;
                </span>
              </div>

              {/* Opción 5: Transferencia SPEI */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center min-h-[140px] shadow-xs hover:border-orange-500 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <Banknote className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-orange-600 transition-colors mt-2">
                  Transferencia electrónica &gt;
                </span>
              </div>

              {/* Opción 6: Pago en Efectivo */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center min-h-[140px] shadow-xs hover:border-orange-500 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-orange-600 transition-colors mt-2">
                  Pago en efectivo en tienda &gt;
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* 10. PILL FLOTANTE DE RESUMEN DE COMPRA                    */}
      {/* ======================================================== */}
      {items.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-950 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-800 animate-slide-up">
          <div>
            <p className="text-xs font-bold text-slate-400">{items.length} productos en tu carrito</p>
            <p className="text-base font-black text-amber-400">${total.toFixed(2)} MXN</p>
          </div>
          <button
            onClick={() => {
              alert(
                `¡Pedido registrado con éxito por $${total.toFixed(2)} MXN!\nPuedes recogerlo con tu número de folio en ${selectedBranch} o pagarlo directo en mostrador.`
              );
            }}
            className="py-2.5 px-4 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <span>Generar Pedido</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 11. FOOTER CORPORATIVO ESTILO THE HOME DEPOT              */}
      {/* ======================================================== */}
      <footer className="bg-[#1f2937] text-slate-400 text-xs mt-16 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-extrabold text-sm mb-3">Atención al Cliente</h4>
            <ul className="space-y-2 text-slate-300">
              <li>Línea Directa: 55-5555-0101</li>
              <li>Preguntas Frecuentes</li>
              <li>Facturación Electrónica SAT</li>
              <li>Devoluciones y Garantías de Fábrica</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-extrabold text-sm mb-3">Sucursales</h4>
            <ul className="space-y-2 text-slate-300">
              <li>Sucursal Centro (Matriz)</li>
              <li>Sucursal Norte Plaza</li>
              <li>Horarios de Atención Extendidos</li>
              <li>Localizador de Tiendas y CEDIS</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-extrabold text-sm mb-3">Servicios para Profesionales</h4>
            <ul className="space-y-2 text-slate-300">
              <li>Ventas a Contratistas y Desarrolladores (B2B)</li>
              <li>Cotizaciones con Reserva de Stock (48h)</li>
              <li>Crédito Comercial y Financiamiento</li>
              <li>Despacho de Material Pesado a Obra</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-extrabold text-sm mb-3">Portal Administrativo</h4>
            <p className="text-slate-400 text-[11px] mb-3">
              ¿Eres personal autorizado, cajero, vendedor, mercadotecnia o administrador?
            </p>
            <Link
              to={isAuthenticated ? (user?.role === 'CAJERO' ? '/admin/cashier' : '/admin/counter-sale') : '/login'}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-600 rounded-lg text-xs font-bold transition-colors"
            >
              {isAuthenticated ? <User className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
              <span>
                {isAuthenticated && user
                  ? `Panel: ${user.full_name ? user.full_name.split(' (')[0] : user.email}`
                  : 'Acceso al Panel de Control'}
              </span>
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-800 py-4 text-center text-[11px] text-slate-500">
          LavaClean Pro &bull; Sistema ERP &amp; Catálogo Comercial Sincronizado en Tiempo Real con Inventario y Caja &bull; Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

