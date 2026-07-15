// ─── All prompts return { system, user } for aiCall() ───

export function promptParseResume(resumeText) {
  return {
    system: `You are a resume parser. Extract structured data from resume text.
Return ONLY valid JSON with these fields:
- name (string, full name)
- email (string)
- phone (string)
- location (string)
- linkedin (string or null)
- portfolio (string or null)
- summary (string, professional summary or null)
- skills (array of strings, technical & soft skills)
- tools (array of strings, tools/technologies)
- languages (array of strings)
- certifications (array of {name, issuer, year})
- experience (array of {title, company, location, startDate, endDate, description, highlights[]})
- education (array of {degree, institution, field, year})
- projects (array of {name, description, technologies[], url})
- softSkills (array of strings)

Extract EVERYTHING you can find. Use null for missing fields. Do NOT invent data.`,
    user: `Extract structured data from this resume:\n\n${resumeText.slice(0, 8000)}`,
  };
}

export function promptAnalyzeResume(resumeText) {
  return {
    system: `You are an expert ATS and resume analyst. Analyze this resume and return valid JSON:
{
  "atsScore": <0-100>,
  "resumeScore": <0-100>,
  "summary": "<2-3 sentence resume summary>",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingSections": ["..."],
  "formattingIssues": ["..."],
  "grammarIssues": ["..."],
  "actionVerbScore": <0-100>,
  "keywordDensity": <0-100>,
  "recruiterReadiness": <0-100>,
  "suggestions": ["top 5 actionable improvements"],
  "actionVerbs": ["better verbs for existing bullets"],
  "keywordSuggestions": ["keywords missing from resume"],
  "careerRecommendations": ["2-3 career path suggestions"],
  "targetRoles": ["best-fit job titles"],
  "contentScore": <0-100>,
  "formatScore": <0-100>,
  "skillScore": <0-100>,
  "readabilityScore": <0-100>,
  "pageCount": <1-3>,
  "wordCount": <number>
}`
,
    user: `Analyze this resume and return scores + detailed feedback:\n\n${resumeText.slice(0, 8000)}`,
  };
}

export function promptMatchJob(resumeText, jobTitle, jobDescription, jobSkills) {
  return {
    system: `You are an expert job matcher. Compare a resume against a job description.
Return valid JSON:
{
  "matchPercentage": <0-100>,
  "matchedSkills": ["skills present in both"],
  "missingSkills": ["skills in job but not in resume"],
  "skillGaps": [{"skill": "...", "importance": "high|medium|low", "note": "..."}],
  "strengths": ["top resume strengths for this role"],
  "weaknesses": ["areas to improve"],
  "experienceFit": <0-100>,
  "educationFit": <0-100>,
  "overallFit": "excellent|good|fair|poor",
  "improvementRoadmap": [
    {"priority": "high|medium|low", "action": "...", "impact": "..."}
  ],
  "recommendedSkills": ["skills worth learning"],
  "readinessScore": <0-100>
}`,
    user: `Resume:\n${resumeText.slice(0, 6000)}\n\nJob Title: ${jobTitle}\nJob Description: ${jobDescription}\nRequired Skills: ${(jobSkills || []).join(', ')}`,
  };
}

export function promptCareerAdvice(query, userContext) {
  return {
    system: `You are a senior career coach. Give practical, specific advice.
Return valid JSON with:
{
  "answer": "direct answer to the question",
  "tips": ["actionable tips"],
  "resources": [{"name": "...", "type": "article|course|tool|book", "description": "..."}],
  "nextSteps": ["immediate actions to take"],
  "relevantSkills": ["skills mentioned"],
  "timeline": "estimated timeline if applicable"
}

Be specific and actionable. No generic platitudes.`,
    user: `Context: I am a ${userContext.role || 'professional'} interested in ${userContext.field || 'tech'}.
${userContext.experience ? `Experience: ${userContext.experience}` : ''}
${userContext.skills ? `Skills: ${userContext.skills.join(', ')}` : ''}

Question: ${query}`,
  };
}

export function promptInterviewPrep(role, company, resumeText) {
  return {
    system: `You are an interview preparation coach. Generate tailored interview prep.
Return valid JSON:
{
  "commonQuestions": [{"question": "...", "answerFramework": "...", "tips": "..."}],
  "technicalQuestions": [{"topic": "...", "question": "...", "keyPoints": ["..."]}],
  "behavioralQuestions": [{"situation": "...", "question": "...", "starExample": "..."}],
  "questionsToAsk": ["smart questions for the interviewer"],
  "preparationTips": ["..."]
}`,
    user: `Role: ${role}\nCompany: ${company}\nResume:\n${(resumeText || '').slice(0, 3000)}`,
  };
}

export function promptSalaryInsights(role, location, experience) {
  return {
    system: `You are a compensation analyst. Provide salary insights.
Return valid JSON:
{
  "rangeLow": <number>,
  "rangeMid": <number>,
  "rangeHigh": <number>,
  "currency": "USD",
  "factors": [{"factor": "...", "impact": "..."}],
  "benchmarkByExperience": [
    {"level": "entry|mid|senior|lead", "range": "...", "percentile": "..."}
  ],
  "negotiationTips": ["..."],
  "totalCompBreakdown": {"base": "...", "equity": "...", "bonus": "...", "benefits": "..."}
}

Use realistic ranges. Note if data is estimated.`,
    user: `Role: ${role}\nLocation: ${location}\nExperience Level: ${experience}`,
  };
}

export function promptLearningPath(role, currentSkills, targetRole) {
  return {
    system: `You are a learning and development advisor. Create a personalized learning path.
Return valid JSON:
{
  "roadmap": [
    {"phase": <1-5>, "title": "...", "duration": "...", "focus": "...", 
     "courses": [{"name": "...", "platform": "...", "duration": "...", "skill": "..."}],
     "projects": [{"name": "...", "description": "...", "skills": ["..."]}],
     "certifications": [{"name": "...", "provider": "...", "value": "..."}]}
  ],
  "estimatedTimeline": "...",
  "prerequisites": ["..."],
  "alternativePaths": ["..."],
  "milestones": [{"title": "...", "criteria": "..."}]
}`,
    user: `Current Role: ${role}\nCurrent Skills: ${(currentSkills || []).join(', ')}\nTarget Role: ${targetRole || 'Senior'}`,
  };
}

export function promptRankCandidates(jobTitle, jobDescription, candidates) {
  const list = candidates.map((c, i) =>
    `Candidate ${i + 1}: Name=${c.name || 'Unknown'}, Skills=${(c.skills || []).join(', ')}, Experience=${c.experience || ''}, Education=${c.education || ''}`
  ).join('\n');

  return {
    system: `You are an expert recruiter AI. Rank candidates for a job opening.
Return valid JSON:
{
  "rankings": [
    {"rank": <1-N>, "candidateIndex": <0-based>, "name": "...", "score": <0-100>,
     "summary": "1-2 sentence summary", "strengths": ["..."], "concerns": ["..."],
     "fit": "excellent|good|fair|poor",
     "recommendedInterviewQuestions": ["3-5 tailored questions"],
     "skillMatchPercent": <0-100>,
     "experienceMatchPercent": <0-100>,
     "educationMatchPercent": <0-100>,
     "redFlags": ["..."],
     "growthPotential": <0-100>}
  ],
  "topCandidateIndex": <0-based>,
  "comparisonSummary": "..."
}`,
    user: `Job Title: ${jobTitle}\nJob Description: ${jobDescription}\n\nCandidates:\n${list}`,
  };
}

export function promptCompareResumes(resumes) {
  const list = resumes.map((r, i) =>
    `Resume ${i + 1}: Name=${r.name}, Skills=${(r.skills || []).join(', ')}, Experience=${r.experience}, Education=${r.education}, Strengths=${(r.strengths || []).join('; ')}`
  ).join('\n\n');

  return {
    system: `You are an expert at comparing resumes side-by-side.
Return valid JSON:
{
  "comparisons": [
    {"aspect": "experience", "winner": <index>, "reason": "...", "details": "..."},
    {"aspect": "skills", "winner": <index>, "reason": "...", "details": "..."},
    {"aspect": "education", "winner": <index>, "reason": "...", "details": "..."},
    {"aspect": "achievements", "winner": <index>, "reason": "...", "details": "..."},
    {"aspect": "culturalFit", "winner": <index>, "reason": "...", "details": "..."}
  ],
  "overallWinner": <index>,
  "summary": "overall comparison summary",
  "keyDifferences": ["..."],
  "recommendation": "which to hire and why"
}`,
    user: `Compare these resumes:\n\n${list}`,
  };
}

export function promptCandidateSummary(candidateName, resumeText) {
  return {
    system: `You are a recruiter AI. Generate a concise candidate summary.
Return valid JSON:
{
  "name": "...",
  "title": "current or most recent title",
  "summary": "2-3 sentence professional summary",
  "keyStrengths": ["top 3-5 strengths"],
  "keyConcerns": ["any concerns or gaps"],
  "yearsOfExperience": <number>,
  "topSkills": ["..."],
  "notableAchievements": ["..."],
  "careerProgression": "description of career trajectory",
  "interviewFocus": ["areas to explore in interview"],
  "verdict": "strong|qualified|consider|weak",
  "recommendedRole": "best-fit role"
}`,
    user: `Candidate: ${candidateName}\nResume:\n${(resumeText || '').slice(0, 5000)}`,
  };
}
