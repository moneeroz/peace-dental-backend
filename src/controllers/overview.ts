import e, { Request, Response } from "express";
import { db } from "../db/drizzle.js";
import { patient, invoice, doctor, appointment } from "../db/schema.js";
import { asc, count, desc, eq, sql } from "drizzle-orm";

// Fetch appointments starting from six months ago
export const fetchAppointments = async (req: Request, res: Response) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    const data = await db
      .select({
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        reason: appointment.reason,
        name: patient.name,
        phone: patient.phone,
        doctor: doctor.name,
        doctorId: appointment.doctorId,
      })
      .from(appointment)
      .leftJoin(patient, eq(appointment.patientId, patient.id))
      .leftJoin(doctor, eq(appointment.doctorId, doctor.id))
      .where(sql`appointment_date > ${sixMonthsAgo}`)
      .orderBy(desc(appointment.appointmentDate));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

// Fetch the latest 5 appointments
export const getLatestAppointments = async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        id: appointment.id,
        date: appointment.appointmentDate,
        reason: appointment.reason,
        patient: patient.name,
        phone: patient.phone,
        doctor: doctor.name,
      })
      .from(appointment)
      .leftJoin(patient, eq(appointment.patientId, patient.id))
      .leftJoin(doctor, eq(appointment.doctorId, doctor.id))
      .orderBy(desc(appointment.appointmentDate))
      .limit(5);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch latest appointments" });
  }
};

// Fetch the latest 5 invoices
export const getLatestInvoices = async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        id: invoice.id,
        amount: invoice.amount,
        name: patient.name,
        phone: patient.phone,
        doctor: doctor.name,
      })
      .from(invoice)
      .leftJoin(patient, eq(invoice.patientId, patient.id))
      .leftJoin(doctor, eq(invoice.doctorId, doctor.id))
      .orderBy(desc(invoice.date))
      .limit(5);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch latest invoices" });
  }
};

// Fetch card data
export const fetchCardData = async (req: Request, res: Response) => {
  const today = new Date();
  let tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  try {
    const appointmentsToday = await db
      .select({ count: count(appointment.id) })
      .from(appointment)
      .where(sql`DATE(Appointment_date) = ${today}`);

    const appointmentsTomorrow = await db
      .select({ count: count(appointment.id) })
      .from(appointment)
      .where(sql`DATE(Appointment_date) = ${tomorrow}`);

    const invoiceStatus = await db
      .select({
        paid: sql`SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)`,
        pending: sql`SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END)`,
      })
      .from(invoice)
      .where(sql`DATE(date) = ${today}`);

    const cardData = {
      appointmentsToday: appointmentsToday[0].count,
      appointmentsTomorrow: appointmentsTomorrow[0].count,
      totalPaidInvoices: invoiceStatus[0].paid ?? 0,
      totalPendingInvoices: invoiceStatus[0].pending ?? 0,
    };
    res.json(cardData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch card data" });
  }
};

// edit appointment time
export const updateAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { appointmentDate } = req.body;

  try {
    await db
      .update(appointment)
      .set({ appointmentDate })
      .where(eq(appointment.id, id));
    res.json({ message: "Appointment updated successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
};
