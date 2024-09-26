import { db } from "../db/drizzle.js";
import { patient, doctor, appointment } from "../db/schema.js";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
const ITEMS_PER_PAGE = 8;
// Create new appointment
export const newAppointment = async (req, res) => {
    const { reason, patientId, doctorId, appointmentDate } = req.body;
    try {
        const data = await db
            .insert(appointment)
            .values({ reason, patientId, doctorId, appointmentDate });
        res.json({ message: "Appointment added successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to add new appointment" });
    }
};
// Update appointment
export const updateAppointment = async (req, res) => {
    const { id } = req.params;
    const { reason, doctorId, appointmentDate } = req.body;
    try {
        await db
            .update(appointment)
            .set({ reason, doctorId, appointmentDate })
            .where(eq(appointment.id, id));
        res.json({ message: "Appointment updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update appointment" });
    }
};
// Delete appointment
export const deleteAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        await db.delete(appointment).where(eq(appointment.id, id));
        res.json({ message: "Appointment deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete appointment" });
    }
};
// Get filtered appointments
export const filteredAppointments = async (req, res) => {
    const { page, query } = req.query;
    const offset = (Number(page) - 1) * ITEMS_PER_PAGE;
    try {
        const data = await db
            .select({
            id: appointment.id,
            reason: appointment.reason,
            date: appointment.appointmentDate,
            name: patient.name,
            phone: patient.phone,
            doctor: doctor.name,
        })
            .from(appointment)
            .leftJoin(patient, eq(appointment.patientId, patient.id))
            .leftJoin(doctor, eq(appointment.doctorId, doctor.id))
            .where(and(or(ilike(patient.name, `%${query}%`), ilike(patient.phone, `%${query}%`), ilike(doctor.name, `%${query}%`), sql `appointment.date::text ILIKE ${`%${query}%`}`, ilike(appointment.reason, `%${query}%`))))
            .orderBy(desc(appointment.date))
            .limit(ITEMS_PER_PAGE)
            .offset(offset);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
};
// Get appointment by id
export const getAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await db
            .select({
            id: appointment.id,
            reason: appointment.reason,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            date: appointment.date,
            name: patient.name,
            appointmentDate: appointment.appointmentDate,
        })
            .from(appointment)
            .leftJoin(patient, eq(appointment.patientId, patient.id))
            .where(eq(appointment.id, id));
        res.json(data[0]);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch appointment" });
    }
};
// Get appointment pages
export const fetchAppointmentsPages = async (req, res) => {
    const { query } = req.query;
    try {
        const pages = await db
            .select({
            count: count(appointment.id),
        })
            .from(appointment)
            .leftJoin(patient, eq(appointment.patientId, patient.id))
            .leftJoin(doctor, eq(appointment.doctorId, doctor.id))
            .where(and(or(ilike(patient.name, `%${query}%`), ilike(patient.phone, `%${query}%`), ilike(doctor.name, `%${query}%`), sql `appointment.date::text ILIKE ${`%${query}%`}`, ilike(appointment.reason, `%${query}%`))));
        const totalPages = Math.ceil(Number(pages[0].count) / ITEMS_PER_PAGE);
        res.json(totalPages);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch patients pages" });
    }
};
//# sourceMappingURL=appointment.js.map