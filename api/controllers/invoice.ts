import { Request, Response } from "express";
import { db } from "../db/drizzle.js";
import { patient, invoice, doctor } from "../db/schema.js";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

const ITEMS_PER_PAGE = 8;

// Create new invoice
export const newInvoice = async (req: Request, res: Response) => {
  const { patientId, doctorId, amount, status, reason, date } = req.body;

  try {
    await db.insert(invoice).values({
      patientId,
      doctorId,
      amount,
      reason,
      status,
      date,
    });

    res.json("Invoice created successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to create new invoice" });
  }
};

// Update invoice
export const updateInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { patientId, doctorId, amount, status, reason, date } = req.body;

  try {
    await db
      .update(invoice)
      .set({ patientId, doctorId, amount, status, reason, date })
      .where(eq(invoice.id, id));

    res.json("Invoice updated successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to update invoice" });
  }
};

// Delete invoice
export const deleteInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.delete(invoice).where(eq(invoice.id, id));

    res.json("Invoice deleted successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to delete invoice" });
  }
};

// Get filtered invoices
export const filteredInvoices = async (req: Request, res: Response) => {
  const { page, query } = req.query;
  const offset = (Number(page) - 1) * ITEMS_PER_PAGE;

  try {
    const data = await db
      .select({
        id: invoice.id,
        amount: invoice.amount,
        date: invoice.date,
        reason: invoice.reason,
        name: patient.name,
        status: invoice.status,
        doctor: doctor.name,
      })
      .from(invoice)
      .leftJoin(patient, eq(invoice.patientId, patient.id))
      .leftJoin(doctor, eq(invoice.doctorId, doctor.id))
      .where(
        or(
          ilike(patient.name, `%${query}%`),
          ilike(doctor.name, `%${query}%`),
          ilike(invoice.reason, `%${query}%`),
          // ilike(invoice.date, `%${query}%`),
          // ilike(invoice.amount, `%${query}%`),
          // ilike(invoice.status, `%${query}%`),
        ),
      )
      .orderBy(desc(invoice.date))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get invoice by id
export const fetchInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = await db
      .select({
        id: invoice.id,
        patientId: invoice.patientId,
        amount: invoice.amount,
        reason: invoice.reason,
        status: invoice.status,
        doctor: doctor.name,
        name: patient.name,
      })
      .from(invoice)
      .leftJoin(doctor, eq(invoice.doctorId, doctor.id))
      .leftJoin(patient, eq(invoice.patientId, patient.id))
      .where(eq(invoice.id, id));

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
};

// Get invoices for a specific patient
export const fetchPatientInvoices = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = await db
      .select({
        id: invoice.id,
        amount: invoice.amount,
        date: invoice.date,
        reason: invoice.reason,
        status: invoice.status,
        name: patient.name,
        doctor: doctor.name,
      })
      .from(invoice)
      .leftJoin(patient, eq(invoice.patientId, patient.id))
      .leftJoin(doctor, eq(invoice.doctorId, doctor.id))
      .where(eq(invoice.patientId, id))
      .orderBy(desc(invoice.date));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patient invoices" });
  }
};

// Get invoices pages
export const fetchInvoicesPages = async (req: Request, res: Response) => {
  const { query } = req.query;
  try {
    const pages = await db
      .select({
        count: count(invoice.id),
      })
      .from(invoice)
      .where(
        and(
          or(
            ilike(patient.name, `%${query}%`),
            ilike(patient.phone, `%${query}%`),
            ilike(doctor.name, `%${query}%`),
            ilike(invoice.reason, `%${query}%`),
            // ilike(invoice.amount, `%${query}%`),
            // ilike(invoice.date, `%${query}%`),
            // ilike(invoice.status, `%${query}%`),
          ),
        ),
      )
      .leftJoin(patient, eq(invoice.patientId, patient.id))
      .leftJoin(doctor, eq(invoice.doctorId, doctor.id));

    const totalPages = Math.ceil(Number(pages[0].count) / ITEMS_PER_PAGE);
    res.json(totalPages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices pages" });
  }
};
