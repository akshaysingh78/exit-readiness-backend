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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'Exit Readiness Backend is running!',
        endpoints: {
            webhook: 'POST /webhook/typeform',
            health: 'GET /health'
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
    //    if (process.env.TYPEFORM_WEBHOOK_SECRET) {
    //        const signature = req.headers['typeform-signature'];
    //        const isValid = verifyTypeformSignature(req.body, signature);
    //        
    //        if (!isValid) {
    //            console.error('Invalid webhook signature');
    //            return res.status(401).json({ error: 'Invalid signature' });
    //        }
    //    }
        
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
        
        // For now, we'll return the report directly
        // In production, you might want to:
        // - Save to database
        // - Upload to cloud storage
        // - Email to user
        
        res.json({
            success: true,
            message: 'Report generated successfully',
            scores: scores,
            reportHtml: htmlReport
        });
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ 
            error: 'Failed to process assessment',
            message: error.message 
        });
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

// Verify Typeform webhook signature
function verifyTypeformSignature(payload, signature) {
    const hash = crypto
        .createHmac('sha256', process.env.TYPEFORM_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('base64');
    
    return `sha256=${hash}` === signature;
}

// Start server
app.listen(PORT, () => {
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
    app.close(() => {
        console.log('HTTP server closed');
    });
});