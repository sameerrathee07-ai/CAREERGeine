import { aiCall, isAiConfigured } from './openai.js';
import { promptRankCandidates, promptCompareResumes, promptCandidateSummary } from './aiPrompts.js';
import logger from './logger.js';

export async function rankCandidates(jobTitle, jobDescription, candidates) {
  if (!isAiConfigured() || !candidates?.length) {
    return {
      rankings: (candidates || []).map((c, i) => ({
        rank: i + 1, candidateIndex: i, name: c.name || 'Unknown',
        score: 50, summary: '', strengths: [], concerns: [],
        fit: 'fair', recommendedInterviewQuestions: [],
        skillMatchPercent: 0, experienceMatchPercent: 0, educationMatchPercent: 0,
        redFlags: [], growthPotential: 50,
      })),
      topCandidateIndex: 0, comparisonSummary: '',
      _source: 'fallback',
    };
  }

  try {
    const result = await aiCall({
      ...promptRankCandidates(jobTitle, jobDescription, candidates),
      temperature: 0.15,
      maxTokens: 2000,
    });
    if (result) return { ...result.data, _source: 'ai' };
  } catch (err) {
    logger.warn(`Candidate ranking AI call failed: ${err.message}`);
  }

  return {
    rankings: [],
    topCandidateIndex: 0, comparisonSummary: '',
    _source: 'fallback',
  };
}

export async function compareResumes(resumes) {
  if (!isAiConfigured() || !resumes?.length) {
    return {
      comparisons: [],
      overallWinner: 0, summary: '', keyDifferences: [],
      recommendation: '',
      _source: 'fallback',
    };
  }

  try {
    const result = await aiCall({
      ...promptCompareResumes(resumes),
      temperature: 0.15,
      maxTokens: 1500,
    });
    if (result) return { ...result.data, _source: 'ai' };
  } catch (err) {
    logger.warn(`Resume comparison AI call failed: ${err.message}`);
  }

  return {
    comparisons: [], overallWinner: 0, summary: '',
    keyDifferences: [], recommendation: '',
    _source: 'fallback',
  };
}

export async function generateCandidateSummary(candidateName, resumeText) {
  if (!isAiConfigured() || !resumeText) {
    return {
      name: candidateName, title: '', summary: '',
      keyStrengths: [], keyConcerns: [], yearsOfExperience: 0,
      topSkills: [], notableAchievements: [], careerProgression: '',
      interviewFocus: [], verdict: 'consider', recommendedRole: '',
      _source: 'fallback',
    };
  }

  try {
    const result = await aiCall({
      ...promptCandidateSummary(candidateName, resumeText),
      temperature: 0.15,
      maxTokens: 1000,
    });
    if (result) return { ...result.data, _source: 'ai' };
  } catch (err) {
    logger.warn(`Candidate summary AI call failed: ${err.message}`);
  }

  return {
    name: candidateName, title: '', summary: '',
    keyStrengths: [], keyConcerns: [], yearsOfExperience: 0,
    topSkills: [], notableAchievements: [], careerProgression: '',
    interviewFocus: [], verdict: 'consider', recommendedRole: '',
    _source: 'fallback',
  };
}
