// HTML Report Generator
// Creates professional HTML reports from Claude's content

function createHTMLReport(reportContent, scores) {
    const timestamp = new Date().toLocaleString();
    const scoreColor = getScoreColor(scores.overall);
    const categoryColor = getCategoryColor(scores.category);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Exit Readiness Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .summary-section {
            padding: 40px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .score-display {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .overall-score {
            display: inline-block;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: ${scoreColor};
            color: white;
            font-size: 2rem;
            font-weight: bold;
            line-height: 100px;
            margin-bottom: 15px;
        }
        
        .category {
            background: ${categoryColor};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-weight: 600;
        }
        
        .scores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .score-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .score-card h3 {
            color: #4a5568;
            font-size: 0.9rem;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        
        .score-number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .content {
            padding: 40px;
        }
        
        .report-section {
            margin-bottom: 30px;
        }
        
        .report-section h2 {
            color: #1e40af;
            font-size: 1.4rem;
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
        }
        
        .report-section h3 {
            color: #374151;
            margin: 15px 0 10px 0;
        }
        
        .report-section p {
            margin-bottom: 15px;
        }
        
        .footer {
            background: #f1f5f9;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .scores-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>Business Exit Readiness Report</h1>
            <p class="subtitle">Professional Assessment by Founders Wealth Group</p>
        </header>

        <div class="summary-section">
            <div class="score-display">
                <div class="overall-score">${scores.overall}</div>
                <div class="category">${scores.category}</div>
            </div>

            <div class="scores-grid">
                <div class="score-card">
                    <h3>Business Performance</h3>
                    <div class="score-number" style="color: ${getScoreColor(scores.sections?.business || 0)}">${scores.sections?.business || 0}</div>
                </div>
                <div class="score-card">
                    <h3>Strategic Position</h3>
                    <div class="score-number" style="color: ${getScoreColor(scores.sections?.strategic || 0)}">${scores.sections?.strategic || 0}</div>
                </div>
                <div class="score-card">
                    <h3>Organizational</h3>
                    <div class="score-number" style="color: ${getScoreColor(scores.sections?.organizational || 0)}">${scores.sections?.organizational || 0}</div>
                </div>
                <div class="score-card">
                    <h3>Owner Readiness</h3>
                    <div class="score-number" style="color: ${getScoreColor(scores.sections?.owner || 0)}">${scores.sections?.owner || 0}</div>
                </div>
                <div class="score-card">
                    <h3>Transaction Ready</h3>
                    <div class="score-number" style="color: ${getScoreColor(scores.sections?.transaction || 0)}">${scores.sections?.transaction || 0}</div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="report-section">
                ${formatReportContent(reportContent)}
            </div>
        </div>

        <footer class="footer">
            <p><strong>Generated:</strong> ${timestamp}</p>
            <p>This confidential report was prepared by Founders Wealth Group</p>
        </footer>
    </div>
</body>
</html>`;
}

// Enhanced HTML Report Generator with Modern Professional Styling
function createEnhancedHTMLReport(reportContent, scores) {
    const timestamp = new Date().toLocaleString();
    const scoreColor = getScoreColor(scores.overall);
    const categoryColor = getCategoryColor(scores.category);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Exit Readiness Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="0%" r="100%"><stop offset="0%" style="stop-color:white;stop-opacity:0.1" /><stop offset="100%" style="stop-color:white;stop-opacity:0" /></radialGradient></defs><ellipse cx="50" cy="0" rx="50" ry="20" fill="url(%23a)"/></svg>') center top/cover no-repeat;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .executive-summary {
            padding: 40px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .score-hero {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .overall-score {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: ${scoreColor};
            color: white;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .category-badge {
            display: inline-block;
            background: ${categoryColor};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.9rem;
        }
        
        .scores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .score-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .score-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .score-card h3 {
            color: #4a5568;
            font-size: 0.9rem;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .score-number {
            font-size: 2.2rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .score-label {
            color: #64748b;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding: 40px;
        }
        
        .report-section {
            margin-bottom: 40px;
            padding: 30px;
            background: #fafbfc;
            border-radius: 15px;
            border-left: 4px solid #3b82f6;
        }
        
        .report-section h2 {
            color: #1e40af;
            font-size: 1.5rem;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }
        
        .report-section h2::before {
            content: '▶';
            margin-right: 10px;
            color: #3b82f6;
        }
        
        .report-section h3 {
            color: #374151;
            font-size: 1.2rem;
            margin: 20px 0 10px 0;
        }
        
        .report-section p {
            margin-bottom: 15px;
            color: #4b5563;
        }
        
        .report-section ul {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .report-section li {
            margin-bottom: 8px;
            color: #4b5563;
        }
        
        .action-items {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
        }
        
        .action-items h3 {
            color: white;
            margin-bottom: 15px;
        }
        
        .priority-high {
            border-left: 4px solid #ef4444;
            background: #fef2f2;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
        }
        
        .priority-medium {
            border-left: 4px solid #f59e0b;
            background: #fffbeb;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
        }
        
        .priority-low {
            border-left: 4px solid #10b981;
            background: #f0fdf4;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
        }
        
        .footer {
            background: #f1f5f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
            color: #64748b;
            margin-bottom: 10px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
            transition: transform 0.2s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .scores-grid {
                grid-template-columns: 1fr;
            }
            
            .container {
                margin: 10px;
                border-radius: 10px;
            }
            
            body {
                padding: 10px;
            }
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>Business Exit Readiness Report</h1>
            <p class="subtitle">Professional Assessment by Founders Wealth Group</p>
        </header>

        <div class="executive-summary">
            <div class="score-hero">
                <div class="overall-score">${scores.overall}</div>
                <div class="category-badge">${scores.category}</div>
            </div>

            <div class="scores-grid">
                <div class="score-card">
                    <h3>Business Performance</h3>
                    <div class="score-number" style="color: ${getScoreColor(scores.sections?.business || 0)}">${scores.sections?.business || 0}</div>
                    <div class="score-label">Financial Health</div>
                </div>
                <div class="score-card">
                    <h3>Strategic Position</h3>
                    <div class="score-number" style="color: ${getScoreColor(scores.sections?.strategic || 0)}">${scores.sections?.strategic || 0}</div>
                    <div class="score-label">Market Advantage</div>
                </div>
                <div class="score-card">
                    <h3>Organizational</h3>
                    <div class="score-number" style="color: ${getScoreColor(scores.sections?.organizational || 0)}">${scores.sections?.organizational || 0}</div>
                    <div class="score-label">Systems & People</div>
                </div>
                <div class="score-card">
                    <h3>Owner Readiness</h3>
                    <div class="score-number" style="color: ${getScoreColor(scores.sections?.owner || 0)}">${scores.sections?.owner || 0}</div>
                    <div class="score-label">Personal Prep</div>
                </div>
                <div class="score-card">
                    <h3>Transaction Ready</h3>
                    <div class="score-number" style="color: ${getScoreColor(scores.sections?.transaction || 0)}">${scores.sections?.transaction || 0}</div>
                    <div class="score-label">Deal Preparation</div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="report-section">
                ${formatReportContent(reportContent)}
            </div>
        </div>

        <footer class="footer">
            <p><strong>Generated on:</strong> ${timestamp}</p>
            <p>This confidential report was prepared exclusively for you by Founders Wealth Group</p>
            <a href="#" class="cta-button">Schedule Your Strategy Call</a>
        </footer>
    </div>
</body>
</html>`;
}

// Helper function to format report content with better HTML structure
function formatReportContent(content) {
    if (!content) return '<p>Report content not available.</p>';
    
    // Split content by double line breaks to identify sections
    const sections = content.split('\n\n');
    let formattedContent = '';
    
    sections.forEach(section => {
        const trimmedSection = section.trim();
        if (trimmedSection) {
            // Check if this looks like a header (all caps, short, ends with :)
            if (trimmedSection.match(/^[A-Z\s]+:?\s*$/)) {
                formattedContent += `<h2>${trimmedSection}</h2>\n`;
            }
            // Check if this looks like a subheader (starts with number or bullet)
            else if (trimmedSection.match(/^\d+\.\s+[A-Z]/)) {
                formattedContent += `<h3>${trimmedSection}</h3>\n`;
            }
            // Regular paragraph
            else {
                formattedContent += `<p>${trimmedSection}</p>\n`;
            }
        }
    });
    
    return formattedContent;
}

// Helper functions for colors
function getScoreColor(score) {
    if (score >= 85) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 55) return '#f59e0b';
    return '#ef4444';
}

function getCategoryColor(category) {
    switch(category?.toUpperCase()) {
        case 'EXIT READY': return '#22c55e';
        case 'NEARLY READY': return '#3b82f6';
        case 'SIGNIFICANT GAPS': return '#f59e0b';
        default: return '#ef4444';
    }
}

// Export both functions
module.exports = {
    createHTMLReport,
    createEnhancedHTMLReport
};