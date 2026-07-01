import { getTaskReportData } from "./report.service.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

// Export CSV
export const exportTasksCSV = async (req, res) => {
  try {
    const tasks = await getTaskReportData();

    if (tasks.length === 0) {
      return res.status(404).json({ error: "No tasks found to export." });
    }

    // Initialize json2csv parser
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(tasks);

    // trigger a file download in the browser
    res.header("Content-Type", "text/csv");
    res.attachment("tasks_report.csv");
    
    return res.status(200).send(csv);
  } catch (error) {
    console.error("CSV Export Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Export PDF
export const exportTasksPDF = async (req, res) => {
  try {
    const tasks = await getTaskReportData();

    if (tasks.length === 0) {
      return res.status(404).json({ error: "No tasks found to export." });
    }

    // PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="tasks_report.pdf"');

    // Initialize PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe the PDF document directly to the response object
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Task Report", { align: "center" });
    doc.moveDown(2);

    // Write task data
    tasks.forEach(task => {
      doc.fontSize(12).text("---------------------------------");
      doc.text(`Task        : ${task.title}`);
      doc.text(`Project     : ${task.project_name || "N/A"}`);
      doc.text(`Created By  : ${task.created_by || "Unknown"}`);
      doc.text(`Assigned To : ${task.assigned_to || "Unassigned"}`);
      doc.text(`Priority    : ${task.priority}`);
      doc.text(`Status      : ${task.status}`);
      
      // Format the date nicely if it exists
      const dueDate = task.due_date 
        ? new Date(task.due_date).toLocaleDateString() 
        : "N/A";
      doc.text(`Due Date    : ${dueDate}`);
      
      doc.moveDown();
    });

    doc.text("---------------------------------");

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("PDF Export Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
  }
};