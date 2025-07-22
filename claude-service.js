// Claude API Integration for Report Generation
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Claude client
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

async function generateReport(scores, answers) {
    // Create the prompt for Claude
    const prompt = createReportPrompt(scores, answers);
    
    try {
        console.log('Calling Claude API...');
        
        const message = await anthropic.messages.create({
            model: 'claude-3-opus-20240229', // or claude-3-sonnet for lower cost
            max_tokens: 4000,
            temperature: 0.7,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });
        
        console.log('Claude response received');
        return message.content[0].text;
        
    } catch (error) {
        console.error('Claude API error:', error);
        throw new Error('Failed to generate report: ' + error.message);
    }
}

function createReportPrompt(scores, answers) {
    const category = scores.category;
    
    return `Please generate a comprehensive Business Exit Readiness Report based on the following assessment results:

ASSESSMENT SCORES:
- Overall Exit Readiness Score: ${scores.overall}/100
- Category: ${category}
- Owner Readiness: ${scores.sections.owner}/100
- Business Performance: ${scores.sections.business}/100
- Strategic Position: ${scores.sections.strategic}/100
- Organizational Readiness: ${scores.sections.organizational}/100
- Transaction Readiness: ${scores.sections.transaction}/100

SPECIAL FLAGS:
${scores.flags.map(flag => `- ${flag}`).join('\n')}

KEY ASSESSMENT DATA:
- Exit Timeline: ${answers.exit_timeline}
- Emotional Readiness: ${answers.emotional_readiness}/10
- Post-Sale Involvement: ${answers.post_sale_involvement}
- Annual Revenue: ${answers.annual_revenue}
- Revenue Growth: ${answers.revenue_growth}
- EBITDA Margin: ${answers.ebitda_margin}
- Customer Concentration: ${answers.customer_concentration}
- Competitive Advantages: ${Array.isArray(answers.competitive_advantages) ? answers.competitive_advantages.join(', ') : 'None identified'}
- Defensibility: ${answers.defensibility}
- Operate Without Owner: ${answers.operate_without_owner}
- Management Depth: ${answers.management_depth}

ADJUSTMENTS APPLIED:
Multipliers: ${scores.adjustments.multipliers.map(m => m.name + ' (' + m.factor + 'x)').join(', ') || 'None'}
Penalties: ${scores.adjustments.penalties.map(p => p.name + ' (' + p.factor + 'x)').join(', ') || 'None'}

Please create a detailed report with the following sections:

1. EXECUTIVE SUMMARY
   - Overall readiness assessment in 2-3 sentences
   - Top 3 strengths (be specific based on the data)
   - Top 3 critical gaps (be specific based on the data)
   - Estimated time to become exit ready
   - Potential value enhancement opportunity (as a percentage range)

2. READINESS SCORE ANALYSIS
   - Explain what the overall score of ${scores.overall} means
   - Highlight which sections are strongest/weakest
   - Explain any special flags identified

3. KEY STRENGTHS TO LEVERAGE
   - Based on high-scoring areas, what are the business's main assets?
   - How can these be emphasized to buyers?
   - What type of buyers would find these most attractive?

4. CRITICAL GAPS TO ADDRESS
   - What are the most urgent issues to fix?
   - Prioritize by impact on valuation
   - Provide specific, actionable recommendations

5. VALUE ENHANCEMENT OPPORTUNITIES
   - List 5-7 specific initiatives to increase business value
   - Estimate the impact of each (High/Medium/Low)
   - Suggested timeline for implementation
   - Quick wins vs. long-term improvements

6. RECOMMENDED EXIT TIMELINE
   - Based on current readiness, when should they target exit?
   - What milestones should be achieved each quarter?
   - What market conditions should they watch for?

7. BUYER LANDSCAPE ANALYSIS
   - Most likely buyer types based on business profile
   - Estimated valuation multiples for this type of business
   - Key selling points for each buyer type

8. IMMEDIATE ACTION PLAN (Next 90 Days)
   - 5 specific actions they should take immediately
   - Who should be involved
   - Expected outcomes

9. PROFESSIONAL TEAM RECOMMENDATIONS
   - What advisors they need based on their gaps
   - When to engage each advisor
   - Rough budget expectations

Please write in a professional but accessible tone, avoiding jargon where possible. Be specific and actionable rather than generic. Focus on insights that are directly relevant to their scores and situation.`;
}

module.exports = {
    generateReport
};