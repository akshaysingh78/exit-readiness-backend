// HTML Report Generator
// Creates a professional HTML report from Claude's content

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
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .score-section {
            background: #f8f9fa;
            padding: 40px;
            text-align: center;
            border-bottom: 3px solid #e0e0e0;
        }
        
        .overall-score {
            display: inline-block;
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background: ${scoreColor};
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }
        
        .overall-score .score {
            font-size: 4em;
            font-weight: bold;
            line-height: 1;
        }
        
        .overall-score .label {
            font-size: 0.9em;
            opacity: 0.9;
            margin-top: 5px;
        }
        
        .category {
            display: inline-block;
            background: ${categoryColor};
            color: white;
            padding: 10px 30px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        
        .section-scores {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .section-score {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .section-score h4 {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 10px;
        }
        
        .section-score .score {
            font-size: 2.5em;
            font-weight: bold;
            color: ${scoreColor};
        }
        
        .content {
            padding: 40px;
        }
        
        .content h2 {
            color: #1e3c72;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .content h3 {
            color: #2a5298;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        
        .content p {
            margin-bottom: 15px;
            color: #555;
        }
        
        .content ul {
            margin-left: 30px;
            margin-bottom: 20px;
        }
        
        .content li {
            margin-bottom: 10px;
            color: #555;
        }
        
        .flags {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .flags h4 {
            color: #856404;
            margin-bottom: 10px;
        }
        
        .flags ul {
            margin-left: 20px;
        }
        
        .footer {
            background: #333;
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        
        .footer p {
            opacity: 0.8;
            margin-bottom: 5px;
        }
        
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
            .header {
                background: #1e3c72;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        
        @media (max-width: 600px) {
            .header h1 {
                font-size: 2em;
            }
            .overall-score {
                width: 150px;
                height: 150px;
            }
            .overall-score .score {
                font-size: 3em;
            }
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Business Exit Readiness Report</h1>
            <p>Comprehensive Assessment Results</p>
            <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.7;">Generated: ${timestamp}</p>
        </div>
        
        <div class="score-section">
            <div class="overall-score">
                <div class="score">${scores.overall}</div>
                <div class="label">Overall Score</div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <div class="category">${scores.category}</div>
            </div>
            
            ${scores.flags.length > 0 ? `
            <div class="flags">
                <h4>Special Considerations:</h4>
                <ul>
                    ${scores.flags.map(flag => `<li>${flag}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            <div class="section-scores">
                <div class="section-score">
                    <h4>Owner Readiness</h4>
                    <div class="score">${scores.sections.owner}</div>
                </div>
                <div class="section-score">
                    <h4>Business Performance</h4>
                    <div class="score">${scores.sections.business}</div>
                </div>
                <div class="section-score">
                    <h4>Strategic Position</h4>
                    <div class="score">${scores.sections.strategic}</div>
                </div>
                <div class="section-score">
                    <h4>Organizational</h4>
                    <div class="score">${scores.sections.organizational}</div>
                </div>
                <div class="section-score">
                    <h4>Transaction</h4>
                    <div class="score">${scores.sections.transaction}</div>
                </div>
            </div>
        </div>
        
        <div class="content">
            ${formatReportContent(reportContent)}
        </div>
        
        <div class="footer">
            <p><strong>Business Exit Readiness Assessment</strong></p>
            <p>This report is confidential and proprietary.</p>
            <p style="margin-top: 15px; font-size: 0.9em;">Powered by AI-driven analysis and industry benchmarks</p>
        </div>
    </div>
</body>
</html>
    `;
}

function formatReportContent(content) {
    // Convert the plain text report to HTML
    // This is a simple formatter - you can enhance it
    
    return content
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^\d+\. (.+)$/gm, '<h3>$1</h3>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/<\/p><h/g, '</p>\n<h')
        .replace(/<\/h(\d)><p>/g, '</h$1>\n<p>');
}

function getScoreColor(score) {
    if (score >= 80) return '#27ae60';  // Green
    if (score >= 65) return '#3498db';  // Blue
    if (score >= 50) return '#f39c12';  // Orange
    if (score >= 35) return '#e67e22';  // Dark Orange
    return '#e74c3c';  // Red
}

function getCategoryColor(category) {
    const colors = {
        'EXIT READY': '#27ae60',
        'NEARLY READY': '#3498db',
        'PREPARATION NEEDED': '#f39c12',
        'SIGNIFICANT GAPS': '#e67e22',
        'NOT READY': '#e74c3c'
    };
    return colors[category] || '#95a5a6';
}

module.exports = {
    createHTMLReport
};