import { aiCall, isAiConfigured } from './openai.js';
import { promptAnalyzeResume } from './aiPrompts.js';
import { extractSkills, generateSuggestions as nlpSuggestions } from './nlp.js';
import logger from './logger.js';

export async function aiAnalyzeResume(resumeText) {
  if (!resumeText || resumeText.trim().length < 20) {
    return buildFallbackAnalysis(resumeText);
  }

  if (isAiConfigured()) {
    try {
      const result = await aiCall({
        ...promptAnalyzeResume(resumeText),
        temperature: 0.15,
        schema: {
          type: 'object',
          properties: {
            atsScore: { type: 'number' },
            resumeScore: { type: 'number' },
            summary: { type: 'string' },
            strengths: { type: 'array', items: { type: 'string' } },
            weaknesses: { type: 'array', items: { type: 'string' } },
            missingSections: { type: 'array', items: { type: 'string' } },
            formattingIssues: { type: 'array', items: { type: 'string' } },
            grammarIssues: { type: 'array', items: { type: 'string' } },
            actionVerbScore: { type: 'number' },
            keywordDensity: { type: 'number' },
            recruiterReadiness: { type: 'number' },
            suggestions: { type: 'array', items: { type: 'string' } },
            actionVerbs: { type: 'array', items: { type: 'string' } },
            keywordSuggestions: { type: 'array', items: { type: 'string' } },
            careerRecommendations: { type: 'array', items: { type: 'string' } },
            targetRoles: { type: 'array', items: { type: 'string' } },
            contentScore: { type: 'number' },
            formatScore: { type: 'number' },
            skillScore: { type: 'number' },
            readabilityScore: { type: 'number' },
            pageCount: { type: 'number' },
            wordCount: { type: 'number' },
          },
          required: ['atsScore', 'resumeScore'],
        },
      });

      if (result) return { ...result.data, _source: 'ai' };
    } catch (err) {
      logger.warn(`AI resume analysis failed, using NLP fallback: ${err.message}`);
    }
  }

  return buildFallbackAnalysis(resumeText);
}

function buildFallbackAnalysis(resumeText) {
  const skills = extractSkills(resumeText || '');
  const words = (resumeText || '').split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const skillScore = Math.min(100, Math.round((skills.length / 20) * 100));
  const contentScore = Math.min(100, Math.round((wordCount / 300) * 100));
  const formatScore = resumeText?.toLowerCase().includes('experience') && resumeText?.toLowerCase().includes('education') ? 85 : 55;
  const atsScore = Math.min(100, Math.round((skillScore + contentScore + formatScore) / 3));
  const resumeScore = Math.min(100, Math.round(atsScore * 0.5 + skillScore * 0.3 + contentScore * 0.2));
  const suggestions = nlpSuggestions(resumeText || '');

  return {
    atsScore,
    resumeScore,
    summary: resumeText ? `Resume contains ${wordCount} words across ${skills.length} identified skills.` : 'No resume text provided.',
    strengths: skills.length > 5 ? ['Good range of technical skills identified'] : [],
    weaknesses: wordCount < 200 ? ['Resume may be too brief'] : [],
    missingSections: [],
    formattingIssues: [],
    grammarIssues: [],
    actionVerbScore: 50,
    keywordDensity: skills.length > 0 ? Math.min(100, Math.round((skills.length / Math.max(wordCount, 1)) * 1000)) : 0,
    recruiterReadiness: Math.round((atsScore + contentScore) / 2),
    suggestions: suggestions.map((s) => ({ text: s })),
    actionVerbs: [],
    keywordSuggestions: [],
    careerRecommendations: [],
    targetRoles: [],
    contentScore,
    formatScore,
    skillScore,
    readabilityScore: Math.min(100, 100 - Math.abs(200 - wordCount) / 2),
    pageCount: Math.max(1, Math.ceil(wordCount / 350)),
    wordCount,
    _source: 'nlp',
  };
}
