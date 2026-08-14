import { pool } from "../config/db.js";

export async function getAdminStats(_req, res) {
  try {
    // KPI totals
    const [[mentorCount]]  = await pool.query(`SELECT COUNT(*) AS total FROM mentor`);
    const [[internCount]]  = await pool.query(`SELECT COUNT(*) AS total FROM intern`);
    const [[cohortCount]]  = await pool.query(`SELECT COUNT(*) AS total FROM cohorts`);

    // Project status counts
    const [[projAgg]] = await pool.query(`
      SELECT
        SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END)   AS done_count,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inprogress_count,
        COUNT(*) AS total
      FROM projects
    `);

    // Projects per cohort (for bar chart)
    const [projectsByCohort] = await pool.query(`
      SELECT c.name AS cohort_name, COUNT(p.id) AS project_count
      FROM cohorts c
      LEFT JOIN projects p ON p.cohorts_id = c.id
      GROUP BY c.id, c.name
      ORDER BY c.id ASC
    `);

    // NEW: Per-mentor KPIs (Done / In Progress / Total)
    const [mentorProjectKPIs] = await pool.query(`
      SELECT
        m.id,
        m.username AS mentor_name,
        COALESCE(SUM(CASE WHEN p.status = 'Done'        THEN 1 ELSE 0 END), 0) AS done_count,
        COALESCE(SUM(CASE WHEN p.status = 'In Progress' THEN 1 ELSE 0 END), 0) AS inprogress_count,
        COALESCE(COUNT(p.id), 0) AS total
      FROM mentor m
      LEFT JOIN projects p ON p.mentor_id = m.id
      GROUP BY m.id, m.username
      ORDER BY m.username ASC
    `);

    res.json({
      kpis: {
        mentors: mentorCount.total,
        interns: internCount.total,
        cohorts: cohortCount.total,
        projects_done: projAgg.done_count ?? 0,
        projects_in_progress: projAgg.inprogress_count ?? 0,
      },
      charts: {
        status: {
          done: projAgg.done_count ?? 0,
          in_progress: projAgg.inprogress_count ?? 0,
        },
        by_cohort: projectsByCohort.map(r => ({
          cohort: r.cohort_name,
          count: Number(r.project_count) || 0,
        })),
      },
      // NEW payload: per-mentor KPIs
      mentors_projects: mentorProjectKPIs.map(r => ({
        mentor_id: r.id,
        mentor_name: r.mentor_name,
        done: Number(r.done_count) || 0,
        in_progress: Number(r.inprogress_count) || 0,
        total: Number(r.total) || 0,
      })),
    });
  } catch (e) {
    console.error("getAdminStats error:", e);
    res.status(500).json({ message: "Server error" });
  }
}
