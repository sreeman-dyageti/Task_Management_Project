import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PageWrapper from '../components/PageWrapper';
import Card from '../components/Card';
import api from '../api/axios';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState('');
  const [error, setError] = useState('');

  const handleDownload = async (type) => {
    setError('');
    setDownloading(type);

    try {
      const res = await api.get(`/reports/tasks/${type}`, {
        responseType: 'blob', // important — treat response as a file
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks_report.${type}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate report. There may be no tasks to export.');
    } finally {
      setDownloading('');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <PageWrapper>
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <Card className="p-8 text-center">
            <p className="text-muted">Only admins can access reports.</p>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark">Reports</h1>
          <p className="text-muted text-sm mt-1">
            Export task data for offline analysis or record keeping
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* CSV Card */}
          <Card className="p-6">
            <div className="w-10 h-10 rounded-lg bg-mustard/15 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-mustard-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17v-2a4 4 0 014-4h4m0 0l-3-3m3 3l-3 3M3 12v6a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2v3" />
              </svg>
            </div>
            <h3 className="text-dark font-semibold mb-1">CSV Export</h3>
            <p className="text-muted text-sm mb-4">
              Spreadsheet-friendly format for Excel or Google Sheets
            </p>
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloading === 'csv'}
              className="w-full bg-mustard hover:bg-mustard-dark text-dark font-medium text-sm py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {downloading === 'csv' ? 'Generating...' : 'Download CSV'}
            </button>
          </Card>

          {/* PDF Card */}
          <Card className="p-6">
            <div className="w-10 h-10 rounded-lg bg-mustard/15 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-mustard-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-dark font-semibold mb-1">PDF Export</h3>
            <p className="text-muted text-sm mb-4">
              Formatted document, ready to print or share
            </p>
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading === 'pdf'}
              className="w-full bg-mustard hover:bg-mustard-dark text-dark font-medium text-sm py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {downloading === 'pdf' ? 'Generating...' : 'Download PDF'}
            </button>
          </Card>

        </div>
      </div>
    </PageWrapper>
  );
}