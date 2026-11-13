import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const listPublicProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category } = req.query;

    const where: any = { is_active: true };

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && typeof category === 'string' && category !== 'Todos') {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar los productos del catálogo.', details: error });
  }
};

/**
 * Endpoint clave solicitado:
 * GET /api/products/qr/:code
 * Busca un producto escaneando su código QR y devuelve su stock actual.
 */
export const getProductByQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    if (!code) {
      res.status(400).json({ error: 'El código QR es requerido.' });
      return;
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ qr_code: code }, { sku: code }],
        is_active: true,
      },
    });

    if (!product) {
      res.status(404).json({ error: `Producto con código QR "${code}" no encontrado.` });
      return;
    }

    res.json({
      id: product.id,
      sku: product.sku,
      qr_code: product.qr_code,
      name: product.name,
      description: product.description,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      min_stock: product.min_stock,
      is_low_stock: product.stock <= product.min_stock,
      image_url: product.image_url,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al escanear el código QR.', details: error });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sku, qr_code, name, description, price, cost, stock, min_stock, category, image_url } = req.body;

    if (!sku || !name || price === undefined) {
      res.status(400).json({ error: 'SKU, nombre y precio son obligatorios.' });
      return;
    }

    const effectiveQr = qr_code || sku; // Si no provee QR específico, usa el SKU

    const existing = await prisma.product.findFirst({
      where: { OR: [{ sku }, { qr_code: effectiveQr }] },
    });

    if (existing) {
      res.status(409).json({ error: 'Ya existe un producto con ese SKU o código QR.' });
      return;
    }

    const newProduct = await prisma.product.create({
      data: {
        sku,
        qr_code: effectiveQr,
        name,
        description,
        price: Number(price),
        cost: cost ? Number(cost) : 0,
        stock: stock ? Number(stock) : 0,
        min_stock: min_stock ? Number(min_stock) : 5,
        category: category || 'General',
        image_url,
      },
    });

    // Si tiene stock inicial, registrar movimiento ENTRADA_AJUSTE
    if (newProduct.stock > 0 && req.user) {
      await prisma.inventoryMovement.create({
        data: {
          product_id: newProduct.id,
          type: 'ENTRADA_AJUSTE',
          quantity: newProduct.stock,
          previous_stock: 0,
          current_stock: newProduct.stock,
          reason: 'Inventario inicial de alta de producto',
          user_id: req.user.id,
        },
      });
    }

    res.status(201).json({
      message: 'Producto registrado exitosamente.',
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto.', details: error });
  }
};

