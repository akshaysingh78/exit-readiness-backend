// PDF Generator using Puppeteer
// Converts HTML reports to professional PDFs

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PDFGenerator {
    constructor() {
        this.browser = null;
    }

    // Initialize browser (reuse for multiple PDFs)
    async init() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process'
                ]
            });
        }
        return this.browser;
    }

    // Generate PDF from HTML report
    async generatePDF(htmlContent, options = {}) {
        try {
            await this.init();
            const page = await this.browser.newPage();

            // Set page content
            await page.setContent(htmlContent, { 
                waitUntil: ['networkidle0', 'domcontentloaded'],
                timeout: 30000 
            });

            // Configure PDF options
            const pdfOptions = {
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                displayHeaderFooter: true,
                headerTemplate: this.getHeaderTemplate(options.companyName),
                footerTemplate: this.getFooterTemplate(),
                ...options
            };

            // Generate PDF
            const pdfBuffer = await page.pdf(pdfOptions);
            await page.close();

            return pdfBuffer;

        } catch (error) {
            console.error('PDF Generation Error:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        }
    }

    // Professional header template
    getHeaderTemplate(companyName = 'Founders Wealth Group') {
        return `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666; padding: 10px 0; border-bottom: 1px solid #eee;">
            <span style="font-weight: bold;">${companyName}</span> - Business Exit Readiness Report
        </div>`;
    }

    // Footer with page numbers
    getFooterTemplate() {
        return `
        <div style="font-size: 9px; width: 100%; text-align: center; color: #666; padding: 10px 0; border-top: 1px solid #eee;">
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            <span style="float: right; margin-right: 40px;">Generated on ${new Date().toLocaleDateString()}</span>
        </div>`;
    }

    // Enhanced HTML template for PDF
    getPDFOptimizedHTML(reportContent, scores) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Business Exit Readiness Report</title>
    <style>
        @page {
            size: A4;
            margin: 0.75in 0.5in 0.75in 0.5in;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
            background: white;
        }
        
        .pdf-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
        }
        
        .pdf-header h1 {
            font-size: 24px;
            color: #1e40af;
            margin: 0 0 10px 0;
        }
        
        .pdf-header .subtitle {
            font-size: 14px;
            color: #666;
            margin: 5px 0;
        }
        
        .executive-summary {
            background: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        
        .executive-summary h2 {
            color: #1e40af;
            margin-top: 0;
            font-size: 16px;
        }
        
        .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        
        .score-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            background: white;
        }
        
        .score-card h3 {
            font-size: 12px;
            margin: 0 0 8px 0;
            color: #374151;
            text-transform: uppercase;
            font-weight: 600;
        }
        
        .score-number {
            font-size: 24px;
            font-weight: bold;
            margin: 5px 0;
        }
        
        .score-label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
        }
        
        /* Score colors */
        .score-excellent { color: #059669; }
        .score-good { color: #0891b2; }
        .score-fair { color: #d97706; }
        .score-needs-work { color: #dc2626; }
        
        .section {
            margin: 25px 0;
            page-break-inside: avoid;
        }
        
        .section h2 {
            color: #1e40af;
            font-size: 16px;
            margin-bottom: 12px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .section h3 {
            color: #374151;
            font-size: 14px;
            margin: 15px 0 8px 0;
        }
        
        .section p {
            margin-bottom: 10px;
        }
        
        .action-items {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 15px 0;
        }
        
        .action-items h3 {
            color: #92400e;
            margin-top: 0;
        }
        
        .priority-high { 
            background: #fef2f2; 
            border-left-color: #ef4444;
            padding: 10px;
            margin: 10px 0;
        }
        
        .priority-medium { 
            background: #fefbf2; 
            border-left-color: #f59e0b;
            padding: 10px;
            margin: 10px 0;
        }
        
        .priority-low { 
            background: #f0fdf4; 
            border-left-color: #22c55e;
            padding: 10px;
            margin: 10px 0;
        }
        
        ul {
            padding-left: 20px;
        }
        
        li {
            margin-bottom: 5px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .no-break {
            page-break-inside: avoid;
        }
        
        @media print {
            .pdf-header {
                margin-top: 0;
            }
        }
    </style>
</head>
<body>
    <div class="pdf-header">
        <h1>Business Exit Readiness Report</h1>
        <div class="subtitle">Confidential Assessment</div>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="executive-summary no-break">
        <h2>Executive Summary</h2>
        <p><strong>Overall Exit Readiness Score: <span class="score-number ${this.getScoreClass(scores.overall)}">${scores.overall}/100</span></strong></p>
        <p><strong>Readiness Category:</strong> ${scores.category}</p>
    </div>

    <div class="score-grid no-break">
        <div class="score-card">
            <h3>Business Performance</h3>
            <div class="score-number ${this.getScoreClass(scores.businessPerformance)}">${scores.businessPerformance}</div>
            <div class="score-label">Financial Health</div>
        </div>
        <div class="score-card">
            <h3>Strategic Position</h3>
            <div class="score-number ${this.getScoreClass(scores.strategicPosition)}">${scores.strategicPosition}</div>
            <div class="score-label">Market Advantage</div>
        </div>
        <div class="score-card">
            <h3>Organizational</h3>
            <div class="score-number ${this.getScoreClass(scores.organizationalReadiness)}">${scores.organizationalReadiness}</div>
            <div class="score-label">Systems & People</div>
        </div>
        <div class="score-card">
            <h3>Owner Readiness</h3>
            <div class="score-number ${this.getScoreClass(scores.ownerReadiness)}">${scores.ownerReadiness}</div>
            <div class="score-label">Personal Preparation</div>
        </div>
        <div class="score-card">
            <h3>Transaction Ready</h3>
            <div class="score-number ${this.getScoreClass(scores.transactionReadiness)}">${scores.transactionReadiness}</div>
            <div class="score-label">Deal Preparation</div>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section">
        ${reportContent}
    </div>

</body>
</html>`;
    }

    // Get CSS class based on score
    getScoreClass(score) {
        if (score >= 85) return 'score-excellent';
        if (score >= 70) return 'score-good';
        if (score >= 55) return 'score-fair';
        return 'score-needs-work';
    }

    // Save PDF to file (for development)
    async savePDFToFile(htmlContent, filename, options = {}) {
        try {
            const pdfBuffer = await this.generatePDF(htmlContent, options);
            const filePath = path.join(__dirname, 'reports', filename);
            
            // Ensure reports directory exists
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            
            // Write PDF file
            await fs.writeFile(filePath, pdfBuffer);
            
            console.log(`✅ PDF saved to: ${filePath}`);
            return filePath;
            
        } catch (error) {
            console.error('Save PDF Error:', error);
            throw error;
        }
    }

    // Cleanup browser
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

module.exports = PDFGenerator;