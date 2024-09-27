import { Request, Response } from "express";
import { db } from "../db/drizzle.js";
import { sql } from "drizzle-orm";
import { ParsedQs } from "qs";

// Fetch year revenue to date
export const fetchYearRevenue = async (req: Request, res: Response) => {
  const { year } = req.query;

  const effectiveYear = year ? Number(year) : null;

  try {
    let revenuQuery = sql`SELECT
    EXTRACT(MONTH FROM date) AS month,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid,
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending
    FROM
    invoice
    WHERE`;

    // Add month condition if provided
    if (!effectiveYear) {
      revenuQuery = sql`${revenuQuery} date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY
    month
    ORDER BY
    month DESC;`;
    } else {
      revenuQuery = sql`${revenuQuery} EXTRACT(YEAR FROM date) = ${effectiveYear}
      GROUP BY
    month
    ORDER BY
    month DESC;`;
    }

    const data = await db.execute(revenuQuery);

    // convert data to a revenue object
    const result = data.rows.map((row) => ({
      month: Number(row.month),
      paid: row.paid,
      pending: row.pending,
    }));

    //
    const revenue = result.reduce((acc, invoice) => {
      const month = invoice.month;
      if (!acc[month]) {
        acc[month] = { month, paid: 0, pending: 0 };
      }

      acc[month].paid += Number(invoice.paid);

      acc[month].pending += Number(invoice.pending);

      return acc;
    }, {} as Record<number, { month: number; paid: number; pending: number }>);

    const revenueArray = Object.values(revenue)
      .map((row) => ({
        name: convertMonth(row.month), // Convert month number to month name
        series: [
          { name: "Paid", value: row.paid },
          { name: "Pending", value: row.pending },
        ],
      }))
      .sort((a, b) => b.name.localeCompare(a.name));

    res.json(revenueArray);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

export const fetchRevenueCardData = async (req: Request, res: Response) => {
  let { month, year, doctorId } = req.query;

  // Validate inputs
  if (year && !isValidYear(year)) {
    return res.status(400).json({ error: "Invalid year format." });
  }
  if (month && !isValidMonth(month)) {
    return res.status(400).json({ error: "Invalid month format." });
  }

  const currentYear = new Date().getFullYear();
  const effectiveYear = year ? Number(year) : currentYear;
  const effectiveMonth = month ? Number(month) : null;

  try {
    // Base SQL for invoice data
    let invoiceQuery = sql`
      SELECT
          COUNT(*) AS "numberOfInvoices",
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "totalPaidInvoices",
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "totalPendingInvoices"
      FROM invoice
      WHERE EXTRACT(YEAR FROM date) = ${effectiveYear}`;

    // Add month condition if provided
    if (effectiveMonth) {
      invoiceQuery = sql`${invoiceQuery} AND EXTRACT(MONTH FROM date) = ${effectiveMonth}`;
    }

    // Add doctorId condition if provided
    if (doctorId) {
      invoiceQuery = sql`${invoiceQuery} AND doctor_id = ${doctorId}`;
    }

    const invoicePromise = db.execute(invoiceQuery);

    // Base SQL for patient count
    let patientCountQuery = sql`
      SELECT COUNT(*) AS count
      FROM patient
      WHERE EXTRACT(YEAR FROM created_at) = ${effectiveYear}`;

    // Add month condition if provided
    if (effectiveMonth) {
      patientCountQuery = sql`${patientCountQuery} AND EXTRACT(MONTH FROM created_at) = ${effectiveMonth}`;
    }

    const [invoiceData, patientCountData] = await Promise.all([
      invoicePromise,
      db.execute(patientCountQuery),
    ]);

    const { numberOfInvoices, totalPaidInvoices, totalPendingInvoices } =
      invoiceData.rows[0] || {};
    const { count: numberOfPatients } = patientCountData.rows[0] || {
      count: 0,
    };

    // Formatting the data
    const formattedData = {
      numberOfInvoices: Number(numberOfInvoices) || 0,
      totalPaidInvoices: Number(totalPaidInvoices) || 0,
      totalPendingInvoices: Number(totalPendingInvoices) || 0,
      numberOfPatients,
    };

    res.json(formattedData);
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ error: "Failed to fetch card data." });
  }
};

// Utility functions
const isValidYear = (year: string | ParsedQs | string[] | ParsedQs[]) => {
  const yearNum = Number(year);
  return !isNaN(yearNum) && yearNum > 2020 && yearNum <= 2100;
};

const isValidMonth = (month: string | ParsedQs | string[] | ParsedQs[]) => {
  const monthNum = Number(month);
  return monthNum >= 1 && monthNum <= 12; // Valid months are 1-12
};

const convertMonth = (month: number): string => {
  switch (month) {
    case 1:
      return "January";
    case 2:
      return "February";
    case 3:
      return "March";
    case 4:
      return "April";
    case 5:
      return "May";
    case 6:
      return "June";
    case 7:
      return "July";
    case 8:
      return "August";
    case 9:
      return "September";
    case 10:
      return "October";
    case 11:
      return "November";
    case 12:
      return "December";
    default:
      return "";
  }
};
