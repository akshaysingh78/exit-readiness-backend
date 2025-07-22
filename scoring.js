// Complete Scoring Algorithm for Exit Readiness Assessment
// Implements all scoring rules, multipliers, and penalties

const { normalizeAnswer } = require('./typeform-parser');

// Main scoring function
function calculateScores(answers) {
    // Calculate section scores
    const sectionScores = {
        owner: calculateOwnerReadiness(answers),
        business: calculateBusinessPerformance(answers),
        strategic: calculateStrategicPosition(answers),
        organizational: calculateOrganizationalReadiness(answers),
        transaction: calculateTransactionReadiness(answers)
    };
    
    // Calculate weighted base score
    const weights = getWeights(answers);
    let weightedScore = 0;
    for (const [section, score] of Object.entries(sectionScores)) {
        weightedScore += score * weights[section];
    }
    
    // Apply global adjustments
    const multipliers = getApplicableMultipliers(answers, sectionScores);
    const penalties = getApplicablePenalties(answers, sectionScores);
    
    // Apply all multipliers and penalties
    let finalScore = weightedScore;
    multipliers.forEach(m => finalScore *= m.factor);
    penalties.forEach(p => finalScore *= p.factor);
    
    // Cap score if critical issues exist
    if (hasCriticalIssues(answers)) {
        finalScore = Math.min(finalScore, 40);
    }
    
    // Round to integer
    finalScore = Math.round(finalScore);
    
    // Determine category and flags
    const category = determineCategory(finalScore, answers);
    const flags = identifyFlags(answers, sectionScores, finalScore);
    
    return {
        overall: finalScore,
        sections: sectionScores,
        category: category,
        flags: flags,
        adjustments: {
            multipliers: multipliers,
            penalties: penalties,
            weights: weights
        }
    };
}

// Section 1: Owner Readiness Scoring
function calculateOwnerReadiness(answers) {
    const scores = {
        motivation: scoreOwnerMotivation(answers.owner_motivation),
        timeline: scoreExitTimeline(answers.exit_timeline),
        flexibility: scoreTimelineFlexibility(answers.timeline_flexibility),
        valuation_method: scoreValuationMethod(answers.valuation_method),
        net_worth: scoreNetWorthConcentration(answers.net_worth_concentration),
        proceeds: scoreProceedsSufficiency(answers.proceeds_sufficiency),
        emotional: answers.emotional_readiness || 5, // Direct 1-10 score
        vision: scorePostExitVision(answers.post_exit_vision),
        involvement: scorePostSaleInvolvement(answers.post_sale_involvement),
        family: scoreFamilyAlignment(answers.family_alignment)
    };
    
    // Calculate weighted average
    const weights = {
        motivation: 0.10,
        timeline: 0.15,
        flexibility: 0.10,
        valuation_method: 0.10,
        net_worth: 0.10,
        proceeds: 0.15,
        emotional: 0.15,
        vision: 0.10,
        involvement: 0.05,
        family: 0.05
    };
    
    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
        totalScore += (scores[key] || 0) * weight * 10;
    }
    
    return Math.round(totalScore);
}

// Section 2: Business Performance Scoring
function calculateBusinessPerformance(answers) {
    const scores = {
        revenue_growth: scoreRevenueGrowth(answers.revenue_growth),
        ebitda: scoreEBITDA(answers.ebitda_margin),
        revenue_quality: scoreRevenueQuality(answers.revenue_quality),
        concentration: scoreCustomerConcentration(answers.customer_concentration),
        gross_margin: scoreGrossMargin(answers.gross_margin),
        capex: scoreCapex(answers.capex_requirements),
        cash_flow: scoreCashFlow(answers.cash_flow_status),
        audits: scoreFinancialAudits(answers.financial_audits),
        debt: scoreDebtLevels(answers.debt_levels),
        competitive: scoreCompetitivePosition(answers.competitive_position),
        market_size: scoreMarketSize(answers.market_size),
        market_growth: scoreMarketGrowth(answers.market_growth),
        documentation: scoreProcessDocumentation(answers.process_documentation),
        reporting: scoreFinancialReporting(answers.financial_reporting),
        risk_mgmt: scoreRiskManagement(answers.risk_management)
    };
    
    const weights = {
        revenue_growth: 0.15,
        ebitda: 0.15,
        revenue_quality: 0.10,
        concentration: 0.15,
        gross_margin: 0.10,
        capex: 0.05,
        cash_flow: 0.15,
        audits: 0.05,
        debt: 0.05,
        competitive: 0.10,
        market_size: 0.05,
        market_growth: 0.10,
        documentation: 0.05,
        reporting: 0.05,
        risk_mgmt: 0.05
    };
    
    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
        totalScore += (scores[key] || 0) * weight * 10;
    }
    
    return Math.round(totalScore);
}

// Section 3: Strategic Position Scoring
function calculateStrategicPosition(answers) {
    const scores = {
        value_prop: scoreValueProposition(answers.value_proposition),
        advantages: scoreCompetitiveAdvantages(answers.competitive_advantages),
        defensibility: scoreDefensibility(answers.defensibility),
        projected_growth: scoreProjectedGrowth(answers.projected_growth),
        opportunities: scoreGrowthOpportunities(answers.growth_opportunities),
        investment: scoreGrowthInvestment(answers.growth_investment),
        client_reaction: scoreClientReaction(answers.client_reaction)
    };
    
    const weights = {
        value_prop: 0.20,
        advantages: 0.20,
        defensibility: 0.25,
        projected_growth: 0.15,
        opportunities: 0.10,
        investment: 0.05,
        client_reaction: 0.15
    };
    
    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
        totalScore += (scores[key] || 0) * weight * 10;
    }
    
    return Math.round(totalScore);
}

// Section 4: Organizational Readiness Scoring
function calculateOrganizationalReadiness(answers) {
    const scores = {
        operate: scoreOperateWithoutOwner(answers.operate_without_owner),
        second: scoreSecondInCommand(answers.second_in_command),
        management: scoreManagementDepth(answers.management_depth),
        flight_risk: scoreEmployeeFlightRisk(answers.employee_flight_risk),
        it_infra: scoreITInfrastructure(answers.it_infrastructure),
        cyber: scoreCybersecurity(answers.cybersecurity),
        systems: scoreSystemsIntegration(answers.systems_integration),
        morale: scoreEmployeeMorale(answers.employee_morale),
        knowledge: scoreKnowledgeDocumentation(answers.knowledge_documentation)
    };
    
    const weights = {
        operate: 0.25,
        second: 0.15,
        management: 0.15,
        flight_risk: 0.10,
        it_infra: 0.10,
        cyber: 0.10,
        systems: 0.05,
        morale: 0.05,
        knowledge: 0.15
    };
    
    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
        totalScore += (scores[key] || 0) * weight * 10;
    }
    
    return Math.round(totalScore);
}

// Section 5: Transaction Readiness Scoring
function calculateTransactionReadiness(answers) {
    const scores = {
        legal: scoreLegalIssues(answers.legal_issues),
        records: scoreCorporateRecords(answers.corporate_records),
        ip: scoreIPProtection(answers.ip_protection),
        ma_activity: scoreMAActivity(answers.ma_market_activity),
        comparables: scoreComparables(answers.comparable_transactions),
        conditions: scoreMarketConditions(answers.market_conditions),
        buyers: scoreBuyersIdentified(answers.buyers_identified),
        offers: scoreUnsolicitedOffers(answers.unsolicited_offers)
    };
    
    const weights = {
        legal: 0.25,
        records: 0.15,
        ip: 0.10,
        ma_activity: 0.15,
        comparables: 0.10,
        conditions: 0.10,
        buyers: 0.10,
        offers: 0.05
    };
    
    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
        totalScore += (scores[key] || 0) * weight * 10;
    }
    
    return Math.round(totalScore);
}

// Individual scoring functions
function scoreOwnerMotivation(value) {
    const scores = {
        'Retirement/lifestyle change': 8,
        'Pursue new opportunities': 7,
        'Health concerns': 5,
        'Market timing is favorable': 9,
        'Burnout/loss of passion': 4,
        'Family reasons': 6,
        'Financial needs': 3,
        'Unsolicited offer received': 7
    };
    return scores[value] || 5;
}

function scoreExitTimeline(value) {
    const scores = {
        'Within 12 months': 5,
        '1-2 years': 8,
        '2-3 years': 10,
        '3-5 years': 9,
        '5+ years': 7,
        'Not sure': 3
    };
    return scores[value] || 5;
}

function scoreRevenueGrowth(value) {
    const scores = {
        'Declining': 0,
        'Flat (0-2% annually)': 3,
        'Modest growth (3-10% annually)': 6,
        'Strong growth (11-25% annually)': 9,
        'Exceptional growth (>25% annually)': 10
    };
    return scores[value] || 5;
}

function scoreEBITDA(value) {
    const scores = {
        'Negative/Break-even': 0,
        '0-10%': 3,
        '10-20%': 6,
        '20-30%': 9,
        'Over 30%': 10,
        'Not sure': 1
    };
    return scores[value] || 3;
}

function scoreCustomerConcentration(value) {
    const scores = {
        'Less than 20%': 10,
        '20-40%': 8,
        '40-60%': 5,
        '60-80%': 2,
        'Over 80%': 0
    };
    return scores[value] || 5;
}

function scoreOperateWithoutOwner(value) {
    const scores = {
        'Yes, definitely': 10,
        'Yes, with minor issues': 8,
        'Maybe, with significant challenges': 5,
        'No, would struggle significantly': 2,
        'No, would likely fail': 0
    };
    return scores[value] || 5;
}

// Global multipliers
function getApplicableMultipliers(answers, scores) {
    const multipliers = [];
    
    // Strong moat multiplier
    if (answers.defensibility === 'Very defensible (3+ years)' && 
        ['Market leader', 'Top 3 in market'].includes(answers.competitive_position)) {
        multipliers.push({ name: 'Strong Moat', factor: 1.3 });
    }
    
    // Recurring revenue excellence
    if (answers.revenue_quality === 'Highly recurring/subscription-based (>80%)' &&
        ['Less than 20%', '20-40%'].includes(answers.customer_concentration)) {
        multipliers.push({ name: 'Recurring Revenue Excellence', factor: 1.2 });
    }
    
    // Financial excellence
    if (['20-30%', 'Over 30%'].includes(answers.ebitda_margin) &&
        answers.cash_flow_status === 'Yes, strong positive cash flow') {
        multipliers.push({ name: 'Financial Excellence', factor: 1.15 });
    }
    
    // Audited financials
    if (answers.financial_audits === 'Yes, audited annually') {
        multipliers.push({ name: 'Audited Financials', factor: 1.1 });
    }
    
    return multipliers;
}

// Global penalties
function getApplicablePenalties(answers, scores) {
    const penalties = [];
    
    // Owner dependency check
    if (answers.operate_without_owner === 'No, would likely fail' &&
        answers.post_sale_involvement === 'Want complete exit with no ongoing involvement') {
        penalties.push({ name: 'Critical Owner Dependency', factor: 0.4 });
    } else if (answers.operate_without_owner === 'No, would likely fail' &&
               ['Willing to stay 1-2 years if needed', 'Would like ongoing advisory/board role'].includes(answers.post_sale_involvement)) {
        penalties.push({ name: 'Manageable Owner Dependency', factor: 0.8 });
    }
    
    // Customer concentration risk
    if (answers.customer_concentration === 'Over 80%' &&
        ['Major concern - most clients have strong personal ties', 'Critical issue - business depends on my relationships'].includes(answers.client_reaction)) {
        penalties.push({ name: 'Critical Customer Risk', factor: 0.3 });
    }
    
    // Timeline pressure
    if (answers.exit_timeline === 'Within 12 months' && scores.overall < 70) {
        penalties.push({ name: 'Timeline Pressure', factor: 0.8 });
    }
    
    return penalties;
}

// Dynamic weights based on context
function getWeights(answers) {
    let weights = {
        owner: 0.15,
        business: 0.30,
        strategic: 0.25,
        organizational: 0.20,
        transaction: 0.10
    };
    
    // Adjust for company size
    if (['Under $1 million', '$1-5 million'].includes(answers.annual_revenue)) {
        weights.owner = 0.25;
        weights.strategic = 0.20;
        weights.organizational = 0.15;
    } else if (['$25-50 million', '$50-100 million', 'Over $100 million'].includes(answers.annual_revenue)) {
        weights.owner = 0.10;
        weights.business = 0.25;
        weights.organizational = 0.30;
    }
    
    // Adjust for buyer type
    if (answers.buyer_type === 'Private equity firm') {
        weights.business *= 1.2;
        weights.organizational *= 1.2;
        weights.strategic *= 0.9;
    }
    
    // Normalize weights
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    for (const key in weights) {
        weights[key] = weights[key] / total;
    }
    
    return weights;
}

// Check for critical issues
function hasCriticalIssues(answers) {
    return (
        answers.cash_flow_status === 'No, negative cash flow' ||
        answers.ebitda_margin === 'Negative/Break-even' ||
        answers.legal_issues === 'Major problems'
    );
}

// Determine category
function determineCategory(score, answers) {
    if (score >= 90) return 'EXIT READY';
    if (score >= 75) return 'NEARLY READY';
    if (score >= 60) return 'PREPARATION NEEDED';
    if (score >= 40) return 'SIGNIFICANT GAPS';
    return 'NOT READY';
}

// Identify special flags
function identifyFlags(answers, scores, finalScore) {
    const flags = [];
    
    // Hidden gem
    if (finalScore >= 50 && finalScore <= 70 &&
        answers.defensibility === 'Very defensible (3+ years)') {
        flags.push('Hidden Gem - Strong moat compensates for weaknesses');
    }
    
    // Timeline mismatch
    if (answers.exit_timeline === 'Within 12 months' && finalScore < 70) {
        flags.push('Timeline/Readiness Mismatch - Urgent action needed');
    }
    
    // High seller's remorse risk
    if (answers.owner_motivation === 'Burnout/loss of passion' &&
        answers.emotional_readiness < 5) {
        flags.push('High Seller\'s Remorse Risk');
    }
    
    // PE attractive
    if (answers.buyer_type === 'Private equity firm' &&
        scores.business >= 70 &&
        answers.post_sale_involvement !== 'Want complete exit with no ongoing involvement') {
        flags.push('PE Attractive - Founder transition enhances value');
    }
    
    return flags;
}

// Additional scoring functions (implement remaining ones similarly)
function scoreTimelineFlexibility(value) {
    const scores = {
        'Very flexible - will wait for the right opportunity': 10,
        'Somewhat flexible - prefer to exit within my timeframe but can adjust': 8,
        'Fairly firm - need to exit close to my timeline': 6,
        'Very firm - must exit by a specific date': 4
    };
    return scores[value] || 5;
}

function scoreValuationMethod(values) {
    if (!Array.isArray(values)) return 5;
    
    // Best methods get highest scores
    if (values.includes('Professional business valuation')) return 10;
    if (values.includes('Industry multiples/comparables')) return 8;
    if (values.includes('Previous offers received')) return 7;
    if (values.includes('Informal estimate from advisors')) return 6;
    if (values.includes('Online valuation calculator')) return 4;
    if (values.includes('Gut feeling/personal assessment')) return 3;
    return 1;
}

function scoreNetWorthConcentration(value) {
    const scores = {
        'Less than 25%': 10,
        '25-50%': 8,
        '50-75%': 5,
        'More than 75%': 3
    };
    return scores[value] || 5;
}

function scoreProceedsSufficiency(value) {
    const scores = {
        'Yes, definitely': 10,
        'Yes, with some lifestyle adjustments': 7,
        'No, I\'ll need additional income': 4,
        'Not sure - haven\'t calculated this': 2
    };
    return scores[value] || 5;
}

function scorePostExitVision(value) {
    const scores = {
        'Yes, very clear plans': 10,
        'Some ideas but not fully developed': 6,
        'No, haven\'t thought much about it': 3,
        'No, and this concerns me': 1
    };
    return scores[value] || 5;
}

function scorePostSaleInvolvement(value) {
    const scores = {
        'Want complete exit with no ongoing involvement': 7,
        'Open to short transition period (3-6 months)': 9,
        'Willing to stay 1-2 years if needed': 10,
        'Would like ongoing advisory/board role': 8,
        'Want to retain minority ownership': 6
    };
    return scores[value] || 7;
}

function scoreFamilyAlignment(value) {
    const scores = {
        'Yes, fully aligned and supportive': 10,
        'Yes, but some concerns to address': 6,
        'Partially discussed': 4,
        'No, not yet discussed': 2,
        'Not applicable': 10
    };
    return scores[value] || 5;
}

function scoreRevenueQuality(value) {
    const scores = {
        'Highly recurring/subscription-based (>80%)': 10,
        'Mostly recurring (50-80%)': 8,
        'Mix of recurring and project-based': 6,
        'Mostly project/transaction-based': 4,
        'Varies significantly month-to-month': 2
    };
    return scores[value] || 5;
}

function scoreGrossMargin(value) {
    const scores = {
        'Under 20%': 2,
        '20-30%': 4,
        '30-40%': 6,
        '40-50%': 8,
        '50-60%': 9,
        'Over 60%': 10
    };
    return scores[value] || 5;
}

function scoreCapex(value) {
    const scores = {
        'Minimal - service business with low capex needs': 10,
        'Low - occasional equipment/technology updates': 8,
        'Moderate - regular but manageable investments': 6,
        'High - significant ongoing capital needs': 4,
        'Very high - capital intensive business': 2
    };
    return scores[value] || 5;
}

function scoreCashFlow(value) {
    const scores = {
        'Yes, strong positive cash flow': 10,
        'Yes, moderately positive': 7,
        'Breakeven/slightly positive': 4,
        'Sometimes positive, sometimes negative': 2,
        'No, negative cash flow': 0
    };
    return scores[value] || 5;
}

function scoreFinancialAudits(value) {
    const scores = {
        'Yes, audited annually': 10,
        'Yes, reviewed by CPA': 7,
        'No, but compiled by CPA': 5,
        'No, internally prepared only': 2
    };
    return scores[value] || 5;
}

function scoreDebtLevels(value) {
    const scores = {
        'No debt': 10,
        'Minimal debt (< 1x EBITDA)': 8,
        'Moderate debt (1-3x EBITDA)': 6,
        'Significant debt (3-5x EBITDA)': 3,
        'High debt (> 5x EBITDA)': 1,
        'Not sure': 2
    };
    return scores[value] || 5;
}

function scoreCompetitivePosition(value) {
    const scores = {
        'Market leader': 10,
        'Top 3 in market': 8,
        'Strong niche player': 7,
        'Average competitor': 4,
        'Struggling to compete': 1
    };
    return scores[value] || 5;
}

function scoreMarketSize(value) {
    const scores = {
        'Over $1 billion': 10,
        '$500M - $1 billion': 8,
        '$100M - $500M': 6,
        '$50M - $100M': 4,
        'Under $50M': 2,
        'Not sure': 3
    };
    return scores[value] || 5;
}

function scoreMarketGrowth(value) {
    const scores = {
        'Declining': 0,
        'Flat (0-2%)': 3,
        'Moderate (3-7%)': 6,
        'Strong (8-15%)': 9,
        'Very strong (>15%)': 10,
        'Not sure': 4
    };
    return scores[value] || 5;
}

function scoreProcessDocumentation(value) {
    const scores = {
        'Yes, comprehensively documented': 10,
        'Most critical processes documented': 7,
        'Some documentation exists': 4,
        'Minimal documentation': 2,
        'No formal documentation': 0
    };
    return scores[value] || 5;
}

function scoreFinancialReporting(value) {
    const scores = {
        'Excellent - real-time dashboards, detailed analytics': 10,
        'Good - monthly reports, key metrics tracked': 7,
        'Adequate - basic financial statements produced': 5,
        'Needs improvement - often delayed or incomplete': 2,
        'Poor - limited visibility into finances': 0
    };
    return scores[value] || 5;
}

function scoreRiskManagement(value) {
    const scores = {
        'Yes, comprehensive coverage recently reviewed': 10,
        'Yes, but should review/update': 7,
        'Basic coverage in place': 4,
        'Minimal coverage': 1,
        'Not sure what we have': 2
    };
    return scores[value] || 5;
}

function scoreValueProposition(value) {
    const scores = {
        'Very clear and unique in market': 10,
        'Clear with some differentiation': 7,
        'Similar to competitors but well-executed': 5,
        'Unclear or poorly differentiated': 2,
        'Not sure': 3
    };
    return scores[value] || 5;
}

function scoreCompetitiveAdvantages(values) {
    if (!Array.isArray(values)) return 5;
    if (values.includes('None of the above')) return 0;
    
    // 1 point per advantage, max 10
    return Math.min(values.length, 10);
}

function scoreDefensibility(value) {
    const scores = {
        'Very defensible (3+ years)': 10,
        'Moderately defensible (1-3 years)': 7,
        'Limited defensibility (<1 year)': 4,
        'Not defensible': 1,
        'Not sure': 3
    };
    return scores[value] || 5;
}

function scoreProjectedGrowth(value) {
    const scores = {
        'Decline expected': 0,
        'Flat (0-5%)': 3,
        'Moderate (6-15%)': 7,
        'Strong (16-30%)': 9,
        'Very strong (>30%)': 10
    };
    return scores[value] || 5;
}

function scoreGrowthOpportunities(values) {
    if (!Array.isArray(values)) return 5;
    if (values.includes('Limited opportunities')) return 2;
    
    // 1 point per opportunity, max 10
    return Math.min(values.length, 10);
}

function scoreGrowthInvestment(value) {
    const scores = {
        'Minimal - can fund from cash flow': 10,
        'Moderate - some capital needed': 7,
        'Significant - major investment required': 4,
        'Not sure': 5
    };
    return scores[value] || 5;
}

function scoreClientReaction(value) {
    const scores = {
        'No concern - relationships are with the company': 10,
        'Minor concern - some personal relationships': 7,
        'Moderate concern - many buy because of me': 5,
        'Major concern - most clients have strong personal ties': 2,
        'Critical issue - business depends on my relationships': 0
    };
    return scores[value] || 5;
}

function scoreSecondInCommand(value) {
    const scores = {
        'Yes, ready to take over': 10,
        'Yes, but needs 6-12 months development': 7,
        'Potential candidate identified': 4,
        'No clear successor': 1
    };
    return scores[value] || 5;
}

function scoreManagementDepth(value) {
    const scores = {
        'Excellent - strong leaders in all key areas': 10,
        'Good - most positions well-covered': 7,
        'Adequate - some gaps exist': 5,
        'Weak - significant gaps': 2,
        'No real management team': 0
    };
    return scores[value] || 5;
}

function scoreEmployeeFlightRisk(value) {
    const scores = {
        'Less than 10%': 10,
        '10-25%': 7,
        '25-50%': 4,
        'Over 50%': 1,
        'Not sure': 3
    };
    return scores[value] || 5;
}

function scoreITInfrastructure(value) {
    const scores = {
        'Modern and scalable': 10,
        'Good but needs some updates': 7,
        'Adequate but aging': 5,
        'Outdated and problematic': 2,
        'Minimal IT infrastructure': 1
    };
    return scores[value] || 5;
}

function scoreCybersecurity(value) {
    const scores = {
        'Comprehensive security with recent audit': 10,
        'Good security measures in place': 7,
        'Basic protections': 4,
        'Minimal security': 1,
        'Not sure': 2
    };
    return scores[value] || 5;
}

function scoreSystemsIntegration(value) {
    const scores = {
        'Fully integrated ERP/CRM system': 10,
        'Most systems connected': 7,
        'Some integration': 5,
        'Mostly separate systems': 3,
        'Manual processes dominate': 1
    };
    return scores[value] || 5;
}

function scoreEmployeeMorale(value) {
    const scores = {
        'Excellent - highly engaged workforce': 10,
        'Good - generally positive': 7,
        'Average - some concerns': 5,
        'Poor - significant issues': 2,
        'Not sure': 4
    };
    return scores[value] || 5;
}

function scoreKnowledgeDocumentation(value) {
    const scores = {
        'Yes, comprehensive documentation': 10,
        'Most critical knowledge captured': 7,
        'Some documentation exists': 4,
        'Minimal documentation': 2,
        'Knowledge mostly in people\'s heads': 0
    };
    return scores[value] || 5;
}

function scoreLegalIssues(value) {
    const scores = {
        'No issues': 10,
        'Minor issues, easily resolved': 7,
        'Some concerns but manageable': 4,
        'Significant issues': 1,
        'Major problems': 0
    };
    return scores[value] || 5;
}

function scoreCorporateRecords(value) {
    const scores = {
        'Excellent - recently audited': 10,
        'Good - well organized': 7,
        'Adequate - some cleanup needed': 5,
        'Poor - significant work required': 2,
        'Not sure': 3
    };
    return scores[value] || 5;
}

function scoreIPProtection(value) {
    const scores = {
        'Yes, comprehensive protection': 10,
        'Mostly protected': 7,
        'Some protection': 4,
        'Minimal protection': 1,
        'Not applicable': 8,
        'Not sure': 2
    };
    return scores[value] || 5;
}

function scoreMAActivity(value) {
    const scores = {
        'Very active - many recent deals': 10,
        'Moderately active': 7,
        'Some activity': 5,
        'Limited activity': 2,
        'Not sure': 4
    };
    return scores[value] || 5;
}

function scoreComparables(value) {
    const scores = {
        'Yes, several recent comparables': 10,
        'Yes, a few comparables': 7,
        'Limited comparables': 4,
        'No recent comparables': 1,
        'Not sure': 3
    };
    return scores[value] || 5;
}

function scoreMarketConditions(value) {
    const scores = {
        'Excellent - seller\'s market': 10,
        'Good conditions': 7,
        'Average conditions': 5,
        'Challenging conditions': 3,
        'Poor timing': 1,
        'Not sure': 4
    };
    return scores[value] || 5;
}

function scoreBuyersIdentified(value) {
    const scores = {
        'Yes, multiple interested parties': 10,
        'Yes, a few possibilities': 7,
        'One or two ideas': 4,
        'No specific buyers identified': 2,
        'No idea who would buy': 0
    };
    return scores[value] || 5;
}

function scoreUnsolicitedOffers(value) {
    const scores = {
        'Yes, multiple offers': 10,
        'Yes, one or two': 8,
        'Informal interest expressed': 5,
        'No offers or interest': 3
    };
    return scores[value] || 5;
}

module.exports = {
    calculateScores
};