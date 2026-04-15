import { Response } from 'express';
import db from '../db.js';
import { AuditService } from '../services/audit.service.js';

export const getProducts = async (req: any, res: Response) => {
  const search = req.query.search as string;
  try {
    const query = db('products');
    if (search && search.length >= 2) {
      query.where('name', 'LIKE', `%${search}%`)
           .orWhere('sku', 'LIKE', `%${search}%`)
           .limit(200);
    }
    const products = await query;
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req: any, res: Response) => {
  const { sku, name, bottom_price } = req.body;
  if (!name || name.trim() === '') return res.status(400).json({ error: 'Product name is required' });

  try {
    const insertResult = await db('products').insert({
      sku: sku || null,
      name: name.trim(),
      bottom_price: bottom_price || 0
    }).returning('id');

    const id = Array.isArray(insertResult) 
      ? (typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0]) 
      : insertResult;

    await AuditService.log({
      userId: req.user.id,
      action: 'CREATE_PRODUCT',
      entityType: 'product',
      entityId: id,
      description: `Menambahkan produk baru: ${name.trim()} (Bottom: ${bottom_price || 0})`,
      newData: { sku, name, bottom_price }
    });

    res.status(201).json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create product: ' + error.message });
  }
};

export const updateProduct = async (req: any, res: Response) => {
  const { sku, name, bottom_price } = req.body;
  if (!name || name.trim() === '') return res.status(400).json({ error: 'Product name is required' });

  try {
    const oldProduct = await db('products').where({ id: req.params.id }).first();
    if (!oldProduct) return res.status(404).json({ error: 'Product not found' });

    await db('products').where({ id: req.params.id }).update({
      sku: sku || null,
      name: name.trim(),
      bottom_price: bottom_price || 0
    });

    await AuditService.log({
      userId: req.user.id,
      action: 'UPDATE_PRODUCT',
      entityType: 'product',
      entityId: req.params.id,
      description: `Mengubah produk ${oldProduct.name}. Harga dasar berubah dari ${oldProduct.bottom_price} ke ${bottom_price}`,
      oldData: oldProduct,
      newData: { sku, name, bottom_price }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update product: ' + error.message });
  }
};

export const deleteProduct = async (req: any, res: Response) => {
  try {
    const oldProduct = await db('products').where({ id: req.params.id }).first();
    if (!oldProduct) return res.status(404).json({ error: 'Product not found' });

    await db('products').where({ id: req.params.id }).del();

    await AuditService.log({
      userId: req.user.id,
      action: 'DELETE_PRODUCT',
      entityType: 'product',
      entityId: req.params.id,
      description: `Menghapus produk: ${oldProduct.name}`,
      oldData: oldProduct
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete product: ' + error.message });
  }
};

export const importProducts = async (req: any, res: Response) => {
  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'No products provided' });
  }

  try {
    let imported = 0;
    let skipped = 0;
    const missingPrice: string[] = [];
    const importedItems: string[] = [];

    // Knex transaction
    await db.transaction(async (trx) => {
      for (const item of products) {
        if (!item.name || item.name.trim() === '') {
          skipped++;
          continue;
        }

        const price = item.price || 0;
        const sku = item.sku?.trim() || null;
        let existing: any = null;

        if (sku) {
          existing = await trx('products').where({ sku }).first();
        }
        if (!existing && !sku) {
          existing = await trx('products').where({ name: item.name }).andWhere(function() {
            this.whereNull('sku').orWhere('sku', '');
          }).first();
        }

        if (existing) {
          if (price > 0) {
            await trx('products').where({ id: existing.id }).update({
              bottom_price: price,
              name: item.name,
              sku: sku || existing.sku
            });
          }
        } else {
          await trx('products').insert({
            sku,
            name: item.name,
            bottom_price: price
          });
        }

        if (price <= 0) {
          missingPrice.push(item.name);
        }

        importedItems.push(sku ? `${sku} - ${item.name}` : item.name);
        imported++;
      }
    });

    res.json({
      success: true,
      imported,
      skipped,
      missingPrice,
      importedItems: importedItems.slice(0, 50),
      totalItems: importedItems.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to import products: ' + error.message });
  }
};
