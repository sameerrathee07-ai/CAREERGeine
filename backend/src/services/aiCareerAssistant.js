import { aiCall, isAiConfigured } from './openai.js';
import {
  promptCareerAdvice, promptInterviewPrep, promptSalaryInsights, promptLearningPath,
} from './aiPrompts.js';
import logger from './logger.js';

export async function askCareerAdvice(query, userContext = {}) {
  if (!isAiConfigured()) {
    return {
      answer: 'AI career assistant is not available. Please configure OPENAI_API_KEY.',
      tips: ['Set up OPENAI_API_KEY environment variable to enable AI features'],
      resources: [],
      nextSteps: ['Configure the AI service'],
      relevantSkills: [],
      timeline: null,
      _source: 'fallback',
    };
  }

  try {
    const result = await aiCall({
      ...promptCareerAdvice(query, userContext),
      temperature: 0.3,
      maxTokens: 1500,
    });
    if (result) return { ...result.data, _source: 'ai' };
  } catch (err) {
    logger.warn(`Career advice AI call failed: ${err.message}`);
  }

  return {
    answer: 'Unable to generate advice at this time. Please try again.',
    tips: [],
    resources: [],
    nextSteps: [],
    relevantSkills: [],
    timeline: null,
    _source: 'fallback',
  };
}

export async function getInterviewPrep(role, company, resumeText) {
  if (!isAiConfigured()) {
    return {
      commonQuestions: [],
      technicalQuestions: [],
      behavioralQuestions: [],
      questionsToAsk: ['What does a typical day look like?', 'What are the team\'s biggest challenges?'],
      preparationTips: ['Review the job description thoroughly', 'Prepare specific examples from your experience'],
      _source: 'fallback',
    };
  }

  try {
    const result = await aiCall({
      ...promptInterviewPrep(role, company, resumeText),
      temperature: 0.3,
      maxTokens: 2000,
    });
    if (result) return { ...result.data, _source: 'ai' };
  } catch (err) {
    logger.warn(`Interview prep AI call failed: ${err.message}`);
  }

  return {
    commonQuestions: [],
    technicalQuestions: [],
    behavioralQuestions: [],
    questionsToAsk: [],
    preparationTips: ['Review the job description', 'Practice with common interview questions'],
    _source: 'fallback',
  };
}

export async function getSalaryInsights(role, location, experience) {
  if (!isAiConfigured()) {
    return {
      rangeLow: 0, rangeMid: 0, rangeHigh: 0,
      currency: 'USD',
      factors: [],
      benchmarkByExperience: [],
      negotiationTips: ['Research market rates on Glassdoor and Levels.fyi'],
      totalCompBreakdown: null,
      _source: 'fallback',
    };
  }

  try {
    const result = await aiCall({
      ...promptSalaryInsights(role, location, experience),
      temperature: 0.2,
      maxTokens: 1000,
    });
    if (result) return { ...result.data, _source: 'ai' };
  } catch (err) {
    logger.warn(`Salary insights AI call failed: ${err.message}`);
  }

  return {
    rangeLow: 0, rangeMid: 0, rangeHigh: 0,
    currency: 'USD', factors: [], benchmarkByExperience: [],
    negotiationTips: ['Research market rates'],
    totalCompBreakdown: null,
    _source: 'fallback',
  };
}

export async function getLearningPath(role, currentSkills, targetRole) {
  if (!isAiConfigured()) {
    return {
      roadmap: [],
      estimatedTimeline: '',
      prerequisites: [],
      alternativePaths: [],
      milestones: [],
      _source: 'fallback',
    };
  }

  try {
    const result = await aiCall({
      ...promptLearningPath(role, currentSkills, targetRole),
      temperature: 0.3,
      maxTokens: 2000,
    });
    if (result) return { ...result.data, _source: 'ai' };
  } catch (err) {
    logger.warn(`Learning path AI call failed: ${err.message}`);
  }

  return {
    roadmap: [], estimatedTimeline: '', prerequisites: [],
    alternativePaths: [], milestones: [],
    _source: 'fallback',
  };
}
