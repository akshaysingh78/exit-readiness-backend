// Exit Readiness Assessment Backend
// Main server file - handles webhooks from Typeform

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

// Import our modules
const { parseTypeformResponse } = require('./typeform-parser');
const { calculateScores } = require('./scoring');
const { generateReport } = require('./claude-service');
const { createHTMLReport } = require('./report-generator');

// Store reports temporarily (in production, use a database)
const reports = new Map();
let lastReport = null; // Keep this for backward compatibility

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to generate simple IDs
function generateReportId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'Exit Readiness Backend is running!',
        endpoints: {
            webhook: 'POST /webhook/typeform',
            health: 'GET /health',
            report: 'GET /report/:reportId',
            latest: 'GET /report/latest'
        }
    });
});

// Health check for monitoring
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main webhook endpoint for Typeform
app.post('/webhook/typeform', async (req, res) => {
    console.log('Received webhook from Typeform');
    
    try {
        // Verify webhook signature (optional but recommended)
        // Commented out for now
        // if (process.env.TYPEFORM_WEBHOOK_SECRET) {
        //     const signature = req.headers['typeform-signature'];
        //     const isValid = verifyTypeformSignature(req.body, signature);
        //     
        //     if (!isValid) {
        //         console.error('Invalid webhook signature');
        //         return res.status(401).json({ error: 'Invalid signature' });
        //     }
        // }
        
        // Parse Typeform response
        console.log('Parsing Typeform response...');
        const answers = parseTypeformResponse(req.body);
        
        // Calculate scores
        console.log('Calculating scores...');
        const scores = calculateScores(answers);
        console.log('Scores calculated:', scores);
        
        // Generate report with Claude
        console.log('Generating report with Claude...');
        const reportContent = await generateReport(scores, answers);
        
        // Create HTML report
        console.log('Creating HTML report...');
        const htmlReport = createHTMLReport(reportContent, scores);
        
        // Store for temporary viewing (backward compatibility)
        lastReport = htmlReport;
        
        // Store the report with a unique ID
        const reportId = req.body.form_response?.token || generateReportId();
        reports.set(reportId, {
            html: htmlReport,
            scores: scores,
            timestamp: new Date(),
            status: 'ready'
        });
        
        // Clean up old reports (older than 24 hours)
        for (const [id, report] of reports.entries()) {
            if (Date.now() - report.timestamp > 24 * 60 * 60 * 1000) {
                reports.delete(id);
            }
        }
        
        console.log(`Report stored with ID: ${reportId}`);
        
        res.json({
            success: true,
            message: 'Report generated successfully',
            reportId: reportId,
            scores: scores,
            viewUrl: `${process.env.BASE_URL || 'https://your-app.onrender.com'}/report/${reportId}`
        });
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ 
            error: 'Failed to process assessment',
            message: error.message 
        });
    }
});

// Get the latest report
app.get('/report/latest', (req, res) => {
    // Get the most recent report
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
        // No reports yet or still generating
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
    </style>
    <script>
        // Auto-refresh every 3 seconds to check for report
        function checkForReport() {
            fetch(window.location.href)
                .then(response => response.text())
                .then(html => {
                    if (!html.includes('loading-container')) {
                        // Report is ready!
                        document.open();
                        document.write(html);
                        document.close();
                    }
                })
                .catch(console.error);
        }
        
        // Start checking after 5 seconds, then every 3 seconds
        setTimeout(() => {
            checkForReport();
            setInterval(checkForReport, 3000);
        }, 5000);
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
        <p style="font-size: 14px; color: #999;">The page will automatically display your report when ready.</p>
    </div>
</body>
</html>
        `);
    }
});

// Test endpoint (useful for debugging)
app.post('/test', async (req, res) => {
    try {
        // Test with mock data
        const mockAnswers = {
            exit_timeline: '1-2 years',
            emotional_readiness: 7,
            revenue_growth: 'Strong growth (11-25% annually)',
            ebitda_margin: '20-30%',
            operate_without_owner: 'Yes, with minor issues',
            // ... add more test data as needed
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

// Route to view a specific report (keeping for direct access)
app.get('/report/:reportId', (req, res) => {
    const reportId = req.params.reportId;
    
    // Handle the broken token case
    if (reportId === '%7B%7Btoken%7D%7D' || reportId === '{{token}}') {
        res.redirect('/report/latest');
        return;
    }
    
    const report = reports.get(reportId);
    
    if (!report) {
        // Report not found, redirect to latest
        res.redirect('/report/latest');
    } else if (report.status === 'ready') {
        // Report is ready, send it
        res.send(report.html);
    } else {
        // Report still generating
        res.redirect('/report/latest');
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

// Start server
const server = app.listen(PORT, () => {
    console.log(`✅ Exit Readiness Backend running on port ${PORT}`);
    console.log(`🔗 Webhook URL: https://your-domain.com/webhook/typeform`);
    
    // Check for required environment variables
    if (!process.env.CLAUDE_API_KEY) {
        console.warn('⚠️  Warning: CLAUDE_API_KEY not set in .env file');
    }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});