import {
  pgTable,
  uuid,
  pgEnum,
  integer,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "user"]);

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").default("user"),
  refreshToken: varchar("refresh_token", { length: 255 }).notNull(),
});

export const patient = pgTable("patient", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const doctor = pgTable("doctor", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const appointment = pgTable("appointment", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentDate: timestamp("appointment_date", { mode: "string" }).notNull(),
  patientId: uuid("patient_id").notNull(),
  doctorId: uuid("doctor_id").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  date: timestamp("date", { mode: "string" }).notNull().defaultNow(),
});

export const statusEnum = pgEnum("status", ["paid", "pending"]);

export const invoice = pgTable("invoice", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull(),
  doctorId: uuid("doctor_id").notNull(),
  amount: integer("amount").notNull(),
  status: statusEnum("status").notNull(),
  date: timestamp("date", { mode: "string" }).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
});
