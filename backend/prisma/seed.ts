import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos iniciales con estructura jerárquica...');

  const defaultPassword = await bcrypt.hash('123456', 10);

  // 1. Super Administrador (Plataforma)
  await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      email: 'admin@sistema.com',
      password_hash: defaultPassword,
      full_name: 'Super Administrador Global',
      role: 'SUPERADMIN',
    },
  });

  // 2. Nivel Corporativo / Empresa
  const business = await prisma.business.upsert({
    where: { id: 'biz-001' },
    update: {},
    create: {
      id: 'biz-001',
      name: 'LavaClean Pro - Insumos de Lavandería & Tintorería S.A.',
      tax_id: 'LCP240101XYZ',
      contact_email: 'contacto@lavacleanpro.com',
      contact_phone: '+52 55 1234 5678',
    },
  });

  // Director General / Dueño Franquicia
  await prisma.user.upsert({
    where: { email: 'director@alpha.com' },
    update: {},
    create: {
      email: 'director@alpha.com',
      password_hash: defaultPassword,
      full_name: 'Roberto Gómez (Director General)',
      role: 'CLIENTE_ADMIN',
      business_id: business.id,
    },
  });

  // Contabilidad Corporativa (Precios maestros y costos)
  const contabilidadCorp = await prisma.user.upsert({
    where: { email: 'contabilidad.corp@alpha.com' },
    update: {},
    create: {
      email: 'contabilidad.corp@alpha.com',
      password_hash: defaultPassword,
      full_name: 'Lic. Sofia Morales (Contabilidad Corporativa)',
      role: 'CONTABILIDAD_CORP',
      business_id: business.id,
    },
  });

  // Comprador Corporativo (Órdenes de Compra a proveedores)
  await prisma.user.upsert({
    where: { email: 'comprador@alpha.com' },
    update: {},
    create: {
      email: 'comprador@alpha.com',
      password_hash: defaultPassword,
      full_name: 'Laura Compras (Procurement Corporativo)',
      role: 'COMPRADOR_CORP',
      business_id: business.id,
    },
  });

  // Almacenista Central / CEDIS
  await prisma.user.upsert({
    where: { email: 'cedis@alpha.com' },
    update: {},
    create: {
      email: 'cedis@alpha.com',
      password_hash: defaultPassword,
      full_name: 'Ing. Fernando (Almacén Central CEDIS)',
      role: 'ALMACENISTA_CENTRAL',
      business_id: business.id,
    },
  });

  // Marketing & Publicidad
  await prisma.user.upsert({
    where: { email: 'marketing@alpha.com' },
    update: {},
    create: {
      email: 'marketing@alpha.com',
      password_hash: defaultPassword,
      full_name: 'Lic. Mariana Rios (Mercadotecnia & Publicidad)',
      role: 'MARKETING' as any,
      business_id: business.id,
    },
  });

  // 3. Puntos de Venta (Sucursales)
  // Sucursal Centro: Abierta normal
  const branchCentro = await prisma.branch.upsert({
    where: { code: 'POS-CENTRO' },
    update: {},
    create: {
      name: 'Sucursal Centro',
      code: 'POS-CENTRO',
      address: 'Av. Juárez #100, Col. Centro',
      phone: '55-5555-0101',
      min_consumption: 50000.0,
      current_month_sales: 62500.0,
      is_locked: false,
      business_id: business.id,
    },
  });

  // Sucursal Norte: Candado comercial ACTIVO
  await prisma.branch.upsert({
    where: { code: 'POS-NORTE' },
    update: {},
    create: {
      name: 'Sucursal Norte (Módulo Plaza)',
      code: 'POS-NORTE',
      address: 'Plaza Norte Local 45',
      phone: '55-5555-0102',
      min_consumption: 30000.0,
      current_month_sales: 4200.0,
      is_locked: true,
      lock_reason: 'Candado comercial activo: Consumo del mes menor al mínimo ($4,200 de $30,000 pactados).',
      business_id: business.id,
    },
  });

  // 4. Equipo Local de la Sucursal Centro
  // A. Gerente / Administrador de Sucursal
  await prisma.user.upsert({
    where: { email: 'gerente.centro@alpha.com' },
    update: {},
    create: {
      email: 'gerente.centro@alpha.com',
      password_hash: defaultPassword,
      full_name: 'Lic. Marco Antonio (Gerente Sucursal Centro)',
      role: 'ADMIN_SUCURSAL',
      business_id: business.id,
      branch_id: branchCentro.id,
    },
  });

  // B. Finanzas / Auxiliar de Sucursal (Auditoría de caja y gastos locales)
  const finanzasSucursal = await prisma.user.upsert({
    where: { email: 'finanzas.centro@alpha.com' },
    update: {},
    create: {
      email: 'finanzas.centro@alpha.com',
      password_hash: defaultPassword,
      full_name: 'Patricia Finanzas (Caja Chica y Auditoría Local)',
      role: 'FINANZAS_SUCURSAL',
      business_id: business.id,
      branch_id: branchCentro.id,
    },
  });

  // C. Cajero (Caja registradora y cobro)
  const cajero = await prisma.user.upsert({
    where: { email: 'cajero.centro@alpha.com' },
    update: {},
    create: {
      email: 'cajero.centro@alpha.com',
      password_hash: defaultPassword,
      full_name: 'Carlos Cajero (Caja 1 Centro)',
      role: 'CAJERO',
      business_id: business.id,
      branch_id: branchCentro.id,
    },
  });

  // D. Vendedor (Mostrador, cotizaciones con reserva)
  const vendedor = await prisma.user.upsert({
    where: { email: 'vendedor.centro@alpha.com' },
    update: {},
    create: {
      email: 'vendedor.centro@alpha.com',
      password_hash: defaultPassword,
      full_name: 'David Vendedor (Atención y Preventa)',
      role: 'VENDEDOR',
      business_id: business.id,
      branch_id: branchCentro.id,
    },
  });

  // E. Almacenista de Sucursal (Trastienda y mermas)
  await prisma.user.upsert({
    where: { email: 'almacen.centro@alpha.com' },
    update: {},
    create: {
      email: 'almacen.centro@alpha.com',
      password_hash: defaultPassword,
      full_name: 'Miguel Bodega (Almacén Sucursal Centro)',
      role: 'ALMACENISTA_SUCURSAL',
      business_id: business.id,
      branch_id: branchCentro.id,
    },
  });

  // 5. Cliente Externo (Comprador Web B2B/B2C)
  await prisma.user.upsert({
    where: { email: 'cliente@correo.com' },
    update: {},
    create: {
      email: 'cliente@correo.com',
      password_hash: defaultPassword,
      full_name: 'Lic. Roberto Méndez (Lavandería El Sol)',
      role: 'CLIENTE_FINAL',
    },
  });

  // 6. Catálogo de Productos Estratégicos
  const p1 = await prisma.product.upsert({
    where: { sku: 'LAV-DET-01' },
    update: {},
    create: {
      sku: 'LAV-DET-01',
      qr_code: 'QR-LAV-DET-01',
      name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
      description: 'Detergente líquido de alta concentración con enzimas quitamanchas',
      category: 'Detergentes & Químicos',
      price: 680.0,
      cost: 420.0,
      stock: 45,
      reserved_stock: 4,
      in_transit_stock: 20,
      safety_stock: 10,
      min_stock: 15,
      max_stock: 100,
      lead_time_days: 2,
      last_sale_at: new Date(),
    },
  });

  // 7. Registro de Historial de Precios (Contabilidad Corporativa)
  await prisma.priceHistory.create({
    data: {
      product_id: p1.id,
      old_price: 640.0,
      new_price: 680.0,
      old_cost: 390.0,
      new_cost: 420.0,
      changed_by_id: contabilidadCorp.id,
      reason: 'Ajuste anual autorizado de precios por fabricante de químicos',
    },
  });

  // 8. Corte de Caja del Día en Sucursal Centro
  await prisma.cashCut.create({
    data: {
      branch_id: branchCentro.id,
      user_id: cajero.id,
      audited_by_user_id: finanzasSucursal.id,
      initial_cash: 1000.0,
      cash_sales: 3500.0,
      card_sales: 2400.0,
      transfer_sales: 1200.0,
      mixed_sales: 0,
      total_sales: 7100.0,
      expected_cash: 4500.0,
      status: 'ABIERTO',
    },
  });

  // 9. Cotización con Reserva Temporal
  const expDate = new Date();
  expDate.setHours(expDate.getHours() + 48);

  await prisma.quotation.upsert({
    where: { folio: 'COT-2026-0042' },
    update: {},
    create: {
      folio: 'COT-2026-0042',
      branch_id: branchCentro.id,
      user_id: vendedor.id,
      client_name: 'Lavandería & Tintorería El Sol Express',
      client_contact: 'Lic. Roberto Méndez (55-8888-9999)',
      total: 1360.0,
      status: 'RESERVADA',
      reserves_stock: true,
      reservation_expires_at: expDate,
      items: {
        create: [
          {
            product_id: p1.id,
            quantity: 2,
            unit_price: 680.0,
            subtotal: 1360.0,
          },
        ],
      },
    },
  });

  console.log('Seed completado.');
  console.log('Estructura de perfiles de sucursal y corporativo cargada.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
