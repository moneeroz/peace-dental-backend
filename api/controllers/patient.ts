import { Request, Response } from "express";
import { db } from "../db/drizzle.js";
import { patient, invoice } from "../db/schema.js";
import { count, eq, ilike, sql, or, and } from "drizzle-orm";

const ITEMS_PER_PAGE = 8;

// Create new patient
export const newPatient = async (req: Request, res: Response) => {
  const { name, phone } = req.body;

  try {
    const isPhone = phone ?? "none";
    await db.insert(patient).values({ name, phone: isPhone });
    res.json({ message: "Patient created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add new patient" });
  }
};

// Update patient
export const updatePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone } = req.body;

  try {
    await db.update(patient).set({ name, phone }).where(eq(patient.id, id));
    res.json({ message: "Patient updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update patient" });
  }
};

// Delete patient
export const deletePatient = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.delete(patient).where(eq(patient.id, id));
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete patient" });
  }
};

// Get all patients
export const allPatients = async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({ id: patient.id, name: patient.name })
      .from(patient)
      .orderBy(patient.name);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

// Get filtered patients
export const filteredPatients = async (req: Request, res: Response) => {
  const { page, query } = req.query;
  const offset = (Number(page) - 1) * ITEMS_PER_PAGE;

  try {
    const data = await db
      .select({
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        total_invoices: count(invoice.id),
        total_pending: sql`SUM(CASE WHEN ${invoice.status} = 'pending' THEN ${invoice.amount} ELSE 0 END)`,
        total_paid: sql`SUM(CASE WHEN ${invoice.status} = 'paid' THEN ${invoice.amount} ELSE 0 END)`,
      })
      .from(patient)
      .leftJoin(invoice, eq(invoice.patientId, patient.id))
      .where(
        or(
          ilike(patient.name, `%${query}%`),
          ilike(patient.phone, `%${query}%`),
        ),
      )
      .groupBy(patient.id, patient.name, patient.phone)
      .orderBy(patient.name)
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    const patients = data.map((patient) => ({
      ...patient,
      total_pending: patient.total_pending,
      total_paid: patient.total_paid,
    }));

    res.json(patients);
    return;
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

// Get patient by id
export const fetchPatient = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = await db
      .select({ id: patient.id, name: patient.name, phone: patient.phone })
      .from(patient)
      .where(eq(patient.id, id));

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patient" });
  }
};

// Get patients pages
export const fetchPatientsPages = async (req: Request, res: Response) => {
  const { query } = req.query;

  try {
    const pages = await db
      .select({
        count: count(patient),
      })
      .from(patient)
      .where(
        and(
          or(
            ilike(patient.name, `%${query}%`),
            ilike(patient.phone, `%${query}%`),
          ),
        ),
      );

    const totalPages = Math.ceil(Number(pages[0].count) / ITEMS_PER_PAGE);
    res.json(totalPages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patients pages" });
  }
};
