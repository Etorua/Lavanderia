import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

/**
 * Apertura de Caja del Día / Turno
 */
export const openCashCut = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { initial_cash, branch_id } = req.body;

    const targetBranchId = branch_id || user.branch_id;
    if (!targetBranchId) {
      res.status(400).json({ error: 'Debes indicar el punto de venta / sucursal para la apertura.' });
      return;
    }

    if (initial_cash === undefined || Number(initial_cash) < 0) {
      res.status(400).json({ error: 'Debes ingresar un fondo inicial de caja válido (mayor o igual a cero).' });
      return;
    }

    // Verificar si ya existe una caja abierta para este cajero en esta sucursal
    const existing = await prisma.cashCut.findFirst({
      where: {
        branch_id: targetBranchId,
        user_id: user.id,
        status: 'ABIERTO',
      },
    });

    if (existing) {
      res.status(409).json({
        error: 'Ya tienes un corte de caja abierto actualmente.',
        cashCut: existing,
      });
      return;
    }

    const newCashCut = await prisma.cashCut.create({
      data: {
        branch_id: targetBranchId,
        user_id: user.id,
        initial_cash: Number(initial_cash),
        expected_cash: Number(initial_cash),
        status: 'ABIERTO',
      },
      include: {
        branch: { select: { name: true, code: true } },
      },
    });

    res.status(201).json({
      message: `Corte de caja abierto exitosamente con fondo inicial de $${initial_cash}.`,
      cashCut: newCashCut,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al abrir la caja.', details: error });
  }
};

/**
 * Consulta en tiempo real el corte de caja activo del cajero
 */
export const getCurrentCashCut = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const branchId = user.branch_id || (req.query.branch_id as string);

    if (!branchId) {
      res.status(400).json({ error: 'Sucursal no identificada.' });
      return;
    }

    const active = await prisma.cashCut.findFirst({
      where: {
        branch_id: branchId,
        status: 'ABIERTO',
      },
      include: {
        user: { select: { id: true, full_name: true, email: true } },
        sales: {
          select: {
            id: true,
            invoice_number: true,
            total: true,
            payment_method: true,
            created_at: true,
            customer_name: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!active) {
      res.status(404).json({ message: 'No hay ninguna caja abierta en este momento en esta sucursal.' });
      return;
    }

    res.json(active);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar corte actual.', details: error });
  }
};

/**
 * Cierre de Caja / Arqueo del Día (Cajero ingresa el efectivo contado)
 */
export const closeCashCut = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { actual_cash_counted, notes } = req.body;

    if (actual_cash_counted === undefined || Number(actual_cash_counted) < 0) {
      res.status(400).json({ error: 'Debes ingresar el total de efectivo físico contado en el arqueo.' });
      return;
    }

    const cashCut = await prisma.cashCut.findUnique({ where: { id } });
    if (!cashCut) {
      res.status(404).json({ error: 'Corte de caja no encontrado.' });
      return;
    }

    if (cashCut.status !== 'ABIERTO') {
      res.status(400).json({ error: `Este corte de caja ya se encuentra en estado ${cashCut.status}.` });
      return;
    }

    const counted = Number(actual_cash_counted);
    const expected = Number(cashCut.expected_cash);
    const difference = counted - expected; // Positivo = sobrante, Negativo = faltante

    const closed = await prisma.cashCut.update({
      where: { id },
      data: {
        actual_cash_counted: counted,
        difference,
        notes,
        status: 'CERRADO',
        closed_at: new Date(),
      },
    });

    res.json({
      message: 'Corte de caja finalizado exitosamente.',
      summary: {
        fondo_inicial: closed.initial_cash,
        ventas_efectivo: closed.cash_sales,
        ventas_tarjeta: closed.card_sales,
        ventas_transferencia: closed.transfer_sales,
        total_ventas: closed.total_sales,
        efectivo_esperado: closed.expected_cash,
        efectivo_contado: closed.actual_cash_counted,
        diferencia: closed.difference,
        estado_arqueo: difference === 0 ? 'CUADRADO EXACTO' : difference > 0 ? `SOBRANTE DE $${difference}` : `FALTANTE DE $${Math.abs(difference)}`,
      },
      cashCut: closed,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar el corte de caja.', details: error });
  }
};

/**
 * Auditoría y Sellado del Corte (Finanzas de Sucursal / Contabilidad Corp)
 */
export const auditCashCut = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { audit_notes } = req.body;

    const cashCut = await prisma.cashCut.findUnique({ where: { id } });
    if (!cashCut) {
      res.status(404).json({ error: 'Corte de caja no encontrado.' });
      return;
    }

    const nextStatus = user.role === 'CONTABILIDAD_CORP' || user.role === 'SUPERADMIN' ? 'AUDITADO_CORP' : 'AUDITADO_LOCAL';

    const audited = await prisma.cashCut.update({
      where: { id },
      data: {
        status: nextStatus,
        audited_by_user_id: user.id,
        notes: audit_notes ? `${cashCut.notes || ''} [Auditoría: ${audit_notes}]` : cashCut.notes,
      },
    });

    res.json({
      message: `Corte de caja validado y auditado con éxito como ${nextStatus}.`,
      cashCut: audited,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al auditar el corte.', details: error });
  }
};

/**
 * Registro de Gastos Menores de Sucursal (Caja Chica)
 */
export const createBranchExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { concept, amount, receipt_url, branch_id } = req.body;

    const targetBranchId = branch_id || user.branch_id;
    if (!targetBranchId || !concept || !amount) {
      res.status(400).json({ error: 'Sucursal, concepto y monto son requeridos.' });
      return;
    }

    const expense = await prisma.branchExpense.create({
      data: {
        branch_id: targetBranchId,
        user_id: user.id,
        concept,
        amount: Number(amount),
        receipt_url,
      },
      include: {
        user: { select: { full_name: true, role: true } },
      },
    });

    res.status(201).json({
      message: 'Gasto de sucursal registrado exitosamente.',
      expense,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el gasto de sucursal.', details: error });
  }
};

