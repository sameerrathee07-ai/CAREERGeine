import { aiCall, isAiConfigured } from './openai.js';
import { promptMatchJob } from './aiPrompts.js';
import { computeMatchScore as nlpMatchScore, extractSkills } from './nlp.js';
import logger from './logger.js';

export async function aiMatchJob({ resumeText, jobTitle, jobDescription, jobSkills }) {
  if (isAiConfigured()) {
    try {
      const result = await aiCall({
        ...promptMatchJob(resumeText, jobTitle, jobDescription, jobSkills),
        temperature: 0.1,
        schema: {
          type: 'object',
          properties: {
            matchPercentage: { type: 'number' },
            matchedSkills: { type: 'array', items: { type: 'string' } },
            missingSkills: { type: 'array', items: { type: 'string' } },
            skillGaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skill: { type: 'string' },
                  importance: { type: 'string', enum: ['high', 'medium', 'low'] },
                  note: { type: 'string' },
                },
                required: ['skill', 'importance'],
              },
            },
            strengths: { type: 'array', items: { type: 'string' } },
            weaknesses: { type: 'array', items: { type: 'string' } },
            experienceFit: { type: 'number' },
            educationFit: { type: 'number' },
            overallFit: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] },
            improvementRoadmap: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                  action: { type: 'string' },
                  impact: { type: 'string' },
                },
                required: ['priority', 'action', 'impact'],
              },
            },
            recommendedSkills: { type: 'array', items: { type: 'string' } },
            readinessScore: { type: 'number' },
          },
          required: ['matchPercentage', 'overallFit'],
        },
      });

      if (result) return { ...result.data, _source: 'ai' };
    } catch (err) {
      logger.warn(`AI job match failed, using NLP fallback: ${err.message}`);
    }
  }

  // NLP fallback
  const score = nlpMatchScore(resumeText, jobDescription, extractSkills(resumeText));
  const resumeSkills = extractSkills(resumeText);
  const requiredSkills = jobSkills || extractSkills(jobDescription);
  const matched = resumeSkills.filter((s) => requiredSkills.some((js) => js.toLowerCase() === s.toLowerCase()));
  const missing = requiredSkills.filter((js) => !resumeSkills.some((s) => s.toLowerCase() === js.toLowerCase()));

  return {
    matchPercentage: score,
    matchedSkills: matched,
    missingSkills: missing,
    skillGaps: missing.map((s) => ({ skill: s, importance: 'medium', note: 'Not found in resume' })),
    strengths: matched.length > 0 ? [`Matches ${matched.length} of ${requiredSkills.length} required skills`] : [],
    weaknesses: missing.length > 0 ? [`Missing ${missing.length} required skills`] : [],
    experienceFit: score,
    educationFit: 50,
    overallFit: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor',
    improvementRoadmap: missing.slice(0, 5).map((s) => ({
      priority: 'high',
      action: `Learn or highlight experience with ${s}`,
      impact: `Would improve match by ~${Math.round(100 / requiredSkills.length)}%`,
    })),
    recommendedSkills: missing,
    readinessScore: score,
    _source: 'nlp',
  };
}
