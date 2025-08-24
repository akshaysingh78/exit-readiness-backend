// Exit Readiness Assessment Backend
// Main server file - handles webhooks from Typeform

const express = require('express');
const PDFGenerator = require('./pdf-generator');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

// Import our modules
const { parseTypeformResponse } = require('./typeform-parser');
const { calculateScores } = require('./scoring');
const { generateReport, generateClaudePrompt } = require('./claude-service');
const { createHTMLReport, createEnhancedHTMLReport } = require('./report-generator');

// Store reports temporarily (in production, use a database)
const reports = new Map();
let lastReport = null; // Keep this for backward compatibility

// Track submission sessions
const sessions = new Map();

const app = express();
const PORT = process.env.PORT || 3000;
const pdfGenerator = new PDFGenerator();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to generate simple IDs
function generateReportId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${randomStr}`;
}

// Generate session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'Exit Readiness Backend is running!',
        endpoints: {
            webhook: 'POST /webhook/typeform',
            health: 'GET /health',
            report: 'GET /report/:reportId',
            latest: 'GET /report/latest',
            waiting: 'GET /report/waiting'
        }
    });
});

// Health check for monitoring
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main webhook endpoint for Typeform
app.post('/webhook/typeform', async (req, res) => {
    try {
        console.log('Received webhook from Typeform');
        
        // Parse Typeform response
        const parsedData = parseTypeformResponse(req.body);
        console.log('Parsed data:', JSON.stringify(parsedData, null, 2));
        
        // Calculate scores
        console.log('Calculating scores...');
        const scores = calculateScores(parsedData);
        console.log('Scores calculated:', scores);
        
        // Generate Claude report
        console.log('Generating Claude report...');
        const prompt = generateClaudePrompt(parsedData, scores);
        const reportContent = await generateReport(prompt);
        
        // Create enhanced HTML report
        console.log('Creating enhanced HTML report...');
        const htmlReport = createEnhancedHTMLReport(reportContent, scores);
        
        // Store HTML report (skip PDF for now)
        const reportId = generateReportId();
        const timestamp = new Date().toISOString();
        
        // Store in memory
        global.reports = global.reports || {};
        global.reports[reportId] = {
            htmlReport,
            scores,
            timestamp,
            parsedData
        };
        
        console.log(`✅ Enhanced HTML report generated successfully! ID: ${reportId}`);
        
        // Return success with report links
        res.json({ 
            success: true,
            reportId: reportId,
            htmlUrl: `/report/${reportId}`,
            timestamp: timestamp,
            message: 'Enhanced report generated successfully'
        });
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }     
});

// Waiting room for new submissions
app.get('/report/waiting', (req, res) => {
    const sessionId = generateSessionId();
    
    // Create a new session
    sessions.set(sessionId, {
        startTime: Date.now(),
        status: 'waiting',
        reportId: null
    });
    
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Exit Readiness Report</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .loading-container {
            text-align: center;
            background: white;
            padding: 60px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 30px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        h2 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .progress {
            background-color: #f0f0f0;
            border-radius: 10px;
            height: 10px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        .progress-bar {
            background-color: #3498db;
            height: 100%;
            width: 0%;
            animation: progress 20s ease-out forwards;
        }
        @keyframes progress {
            0% { width: 0%; }
            50% { width: 50%; }
            90% { width: 90%; }
            100% { width: 100%; }
        }
        .session-info {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
        }
    </style>
    <script>
        const sessionId = '${sessionId}';
        let attempts = 0;
        
        // Check for report
        function checkForReport() {
            attempts++;
            
            fetch('/api/session/' + sessionId)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ready' && data.reportId) {
                        // Report is ready!
                        window.location.href = '/report/' + data.reportId;
                    } else if (attempts > 40) { // 2 minutes timeout
                        document.querySelector('h2').textContent = 'Taking longer than expected';
                        document.querySelector('p').innerHTML = 'Your report might still be processing. <a href="/report/latest">Click here</a> to check for your report.';
                        document.querySelector('.spinner').style.display = 'none';
                    }
                })
                .catch(console.error);
        }
        
        // Start checking after 3 seconds, then every 3 seconds
        setTimeout(() => {
            checkForReport();
            setInterval(checkForReport, 3000);
        }, 3000);
    </script>
</head>
<body>
    <div class="loading-container">
        <div class="spinner"></div>
        <h2>Generating Your Exit Readiness Report</h2>
        <p>Your personalized report is being prepared based on your assessment responses. This typically takes 15-30 seconds.</p>
        <div class="progress">
            <div class="progress-bar"></div>
        </div>
        <div class="session-info">Session ID: ${sessionId}</div>
    </div>
</body>
</html>
    `);
});

// API endpoint to check session status
app.get('/api/session/:sessionId', (req, res) => {
    const session = sessions.get(req.params.sessionId);
    
    if (!session) {
        res.json({ status: 'not_found' });
    } else {
        res.json({
            status: session.status,
            reportId: session.reportId
        });
    }
});

// Get the latest report
app.get('/report/latest', (req, res) => {
    // If coming from Typeform, redirect to waiting room
    if (req.headers.referer && req.headers.referer.includes('typeform.com')) {
        res.redirect('/report/waiting');
        return;
    }
    
    // Otherwise show the latest report
    let latestReport = null;
    let latestTime = 0;
    
    for (const [id, report] of reports.entries()) {
        if (report.timestamp > latestTime && report.status === 'ready') {
            latestTime = report.timestamp;
            latestReport = report;
        }
    }
    
    if (latestReport) {
        res.send(latestReport.html);
    } else {
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>No Reports Found</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .message-container {
            text-align: center;
            background: white;
            padding: 60px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
        }
        h2 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="message-container">
        <h2>No Reports Available</h2>
        <p>No reports have been generated yet. Please complete the assessment form first.</p>
    </div>
</body>
</html>
        `);
    }
});

// Test endpoint (useful for debugging)
app.post('/test', async (req, res) => {
    try {
        const mockAnswers = {
            exit_timeline: '1-2 years',
            emotional_readiness: 7,
            revenue_growth: 'Strong growth (11-25% annually)',
            ebitda_margin: '20-30%',
            operate_without_owner: 'Yes, with minor issues',
        };
        
        const scores = calculateScores(mockAnswers);
        res.json({ 
            message: 'Test successful',
            scores: scores 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to view a specific report with PDF download link
app.get('/report/:reportId', (req, res) => {
    try {
        const { reportId } = req.params;
        
        // Handle the broken token case
        if (reportId === '%7B%7Btoken%7D%7D' || reportId === '{{token}}') {
            res.redirect('/report/waiting');
            return;
        }
        
        const report = global.reports?.[reportId];
        
        if (!report) {
            return res.status(404).send(`
<!DOCTYPE html>
<html>
<head>
    <title>Report Not Found</title>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .error-container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h2 { color: #333; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="error-container">
        <h2>Report Not Found</h2>
        <p>This report may have expired or doesn't exist.</p>
        <p><a href="/report/latest">View Latest Report</a></p>
    </div>
</body>
</html>
            `);
        }
        
        // Add PDF download link to HTML report
        const htmlWithPDFLink = report.htmlReport.replace(
            '</body>',
            `
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px;">
                <h3>Download Options</h3>
                <a href="/report/${reportId}/pdf" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; margin: 5px;">
                    📄 Download PDF Report
                </a>
                <br>
                <small style="color: #666; margin-top: 10px; display: block;">
                    Generated on ${new Date(report.timestamp).toLocaleString()}
                </small>
            </div>
            </body>`
        );
        
        res.send(htmlWithPDFLink);
        
    } catch (error) {
        console.error('Report view error:', error);
        res.status(500).send('Error loading report');
    }
});

// Download PDF report
app.get('/report/:reportId/pdf', (req, res) => {
    try {
        const { reportId } = req.params;
        const report = global.reports?.[reportId];
        
        if (!report) {
            return res.status(404).send('Report not found');
        }
        
        // Set PDF headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Exit-Readiness-Report-${reportId}.pdf"`);
        res.setHeader('Content-Length', report.pdfBuffer.length);
        
        // Send PDF
        res.send(report.pdfBuffer);
        
        console.log(`📄 PDF downloaded: ${reportId}`);
        
    } catch (error) {
        console.error('PDF download error:', error);
        res.status(500).send('Error downloading PDF');
    }
});

// List all reports (for testing)
app.get('/reports', (req, res) => {
    try {
        const reports = global.reports || {};
        const reportList = Object.keys(reports).map(id => ({
            id,
            timestamp: reports[id].timestamp,
            scores: reports[id].scores,
            htmlUrl: `/report/${id}`,
            pdfUrl: `/report/${id}/pdf`
        }));
        
        res.json({
            totalReports: reportList.length,
            reports: reportList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        });
        
    } catch (error) {
        console.error('Reports list error:', error);
        res.status(500).json({ error: 'Error loading reports list' });
    }
});

// Verify Typeform webhook signature
function verifyTypeformSignature(payload, signature) {
    const hash = crypto
        .createHmac('sha256', process.env.TYPEFORM_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('base64');
    
    return `sha256=${hash}` === signature;
}

// Temporary: View last report (keeping for backward compatibility)
app.get('/last-report', (req, res) => {
    if (lastReport) {
        res.send(lastReport);
    } else {
        res.send('No report generated yet');
    }
});

// Start server with graceful shutdown
const server = app.listen(PORT, () => {
    console.log(`✅ Exit Readiness Backend running on port ${PORT}`);
    console.log(`🔗 Webhook URL: ${process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + PORT}/webhook/typeform`);
    console.log(`📊 Reports dashboard: ${process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + PORT}/reports`);
    
    // Check for required environment variables
    if (!process.env.CLAUDE_API_KEY) {
        console.warn('⚠️  Warning: CLAUDE_API_KEY not set');
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    
    // Close PDF generator
    try {
        await pdfGenerator.close();
        console.log('PDF generator closed');
    } catch (error) {
        console.error('Error closing PDF generator:', error);
    }
    
    // Close server
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    
    // Close PDF generator
    try {
        await pdfGenerator.close();
        console.log('PDF generator closed');
    } catch (error) {
        console.error('Error closing PDF generator:', error);
    }
    
    // Close server
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});