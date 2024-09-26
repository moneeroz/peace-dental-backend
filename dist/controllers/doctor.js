import { db } from "../db/drizzle.js";
import { doctor } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";
// Create new doctor
export const newDoctor = async (req, res) => {
    const { name } = req.body;
    try {
        await db.insert(doctor).values({
            name,
        });
        res.json("Doctor created successfully");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create new doctor" });
    }
};
// Get doctors
export const getDoctors = async (req, res) => {
    try {
        const data = await db.select().from(doctor).orderBy(desc(doctor.id));
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch doctors" });
    }
};
// Get doctor by id
export const getDoctor = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await db.select().from(doctor).where(eq(doctor.id, id));
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch doctor" });
    }
};
// Update doctor
export const updateDoctor = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await db.update(doctor).set({ name }).where(eq(doctor.id, id));
        res.json("Doctor updated successfully");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update doctor" });
    }
};
// Delete doctor
export const deleteDoctor = async (req, res) => {
    const { id } = req.params;
    try {
        await db.delete(doctor).where(eq(doctor.id, id));
        res.json("Doctor deleted successfully");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete doctor" });
    }
};
//# sourceMappingURL=doctor.js.map