import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Quotation, StandbyTicket } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  loadQuotation: (quotation: Quotation) => void;
  activeQuotationFolio: string | null;
  subtotal: number;
  tax: number;
  total: number;
  standbyTickets: StandbyTicket[];
  pauseToStandby: (referenceName: string) => void;
  resumeFromStandby: (ticketId: string) => void;
  deleteStandby: (ticketId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pos_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeQuotationFolio, setActiveQuotationFolio] = useState<string | null>(null);

  const [standbyTickets, setStandbyTickets] = useState<StandbyTicket[]>(() => {
    const saved = localStorage.getItem('pos_standby_tickets');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'stb-1',
            reference_name: 'Recepción Mostrador (Lavandería Del Sol)',
            cart_data: [
              {
                product: {
                  id: 'p1',
                  sku: 'LAV-DET-01',
                  qr_code: 'QR-LAV-DET-01',
                  name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
                  category: 'Detergentes & Químicos',
                  price: 680,
                  cost: 420,
                  stock: 45,
                  reserved_stock: 4,
                  in_transit_stock: 20,
                  safety_stock: 10,
                  min_stock: 15,
                  max_stock: 100,
                  lead_time_days: 2,
                  is_active: true,
                },
                quantity: 2,
                unit_price: 680,
                subtotal: 1360,
              },
            ],
            created_at: new Date().toISOString(),
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem('pos_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('pos_standby_tickets', JSON.stringify(standbyTickets));
  }, [standbyTickets]);

  const addItem = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: nextQty, subtotal: nextQty * i.unit_price }
            : i
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          unit_price: product.price,
          subtotal: quantity * product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity, subtotal: quantity * i.unit_price }
          : i
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setActiveQuotationFolio(null);
  };

  const loadQuotation = (quotation: Quotation) => {
    const loadedItems: CartItem[] = quotation.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    }));
    setItems(loadedItems);
    setActiveQuotationFolio(quotation.folio);
  };

  const pauseToStandby = (referenceName: string) => {
    if (items.length === 0) return;
    const newTicket: StandbyTicket = {
      id: `stb-${Date.now()}`,
      reference_name: referenceName || `Ticket en Espera #${standbyTickets.length + 1}`,
      cart_data: [...items],
      created_at: new Date().toISOString(),
    };
    setStandbyTickets((prev) => [newTicket, ...prev]);
    clearCart();
  };

  const resumeFromStandby = (ticketId: string) => {
    const ticket = standbyTickets.find((t) => t.id === ticketId);
    if (ticket) {
      setItems(ticket.cart_data);
      setStandbyTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setActiveQuotationFolio(null);
    }
  };

  const deleteStandby = (ticketId: string) => {
    setStandbyTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
  const tax = Number((subtotal * 0.16).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        loadQuotation,
        activeQuotationFolio,
        subtotal,
        tax,
        total,
        standbyTickets,
        pauseToStandby,
        resumeFromStandby,
        deleteStandby,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  return context;
};

