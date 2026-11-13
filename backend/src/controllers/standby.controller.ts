import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

/**
 * Guarda el carrito activo en la tabla StandbyTicket en formato JSON
 */
export const saveStandbyTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { reference_name, cart_data, branch_id } = req.body;

    if (!reference_name || !cart_data) {
      res.status(400).json({ error: 'Nombre de referencia (ej. "Mesa 1") y datos del carrito son requeridos.' });
      return;
    }

    const ticket = await prisma.standbyTicket.create({
      data: {
        reference_name,
        cart_data,
        branch_id: branch_id || user.branch_id,
        user_id: user.id,
      },
    });

    res.status(201).json({
      message: `Ticket "${reference_name}" pausado y guardado en espera. La caja está libre para el siguiente cliente.`,
      ticket,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al pausar el ticket.', details: error });
  }
};

/**
 * Lista todos los tickets en espera de la sucursal
 */
export const listStandbyTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const branchId = user.branch_id || (req.query.branch_id as string);

    const tickets = await prisma.standbyTicket.findMany({
      where: branchId ? { branch_id: branchId } : {},
      include: {
        user: { select: { full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar tickets en espera.', details: error });
  }
};

/**
 * Elimina el ticket en espera cuando se recupera de vuelta al carrito de venta
 */
export const deleteStandbyTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.standbyTicket.delete({ where: { id } });

    res.json({ message: 'Ticket en espera recuperado y liberado de la lista temporal.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al liberar el ticket en espera.', details: error });
  }
};

