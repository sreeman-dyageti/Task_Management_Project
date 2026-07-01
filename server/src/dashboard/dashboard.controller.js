import { getDashboard, getMyDashboard } from "./dashboard.service.js";

// Admins
export const getAnalytics = async (req, res) => {
  try {
    const metrics = await getDashboard();
    return res.status(200).json({ success: true, metrics });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Employees
export const getMyAnalytics = async (req, res) => {
  try {
    const metrics = await getMyDashboard(req.user.user_id);
    return res.status(200).json({ success: true, metrics });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};