/**
 * API Entities/Services Export
 * 
 * This file exports all API services for backward compatibility
 * and easier migration from base44 to custom backend
 */

import {
  authService,
  clientsService,
  samplesService,
  workOrdersService,
  workflowsService,
  analysisService,
  analysisTemplatesService,
  quotesService,
  tasksService,
} from './services';

// Export services with backward-compatible names
export const Client = clientsService;
export const Quote = quotesService;
export const Sample = samplesService;
export const WorkOrder = workOrdersService;
export const WorkflowStep = workflowsService;
export const Analysis = analysisService;
export const AnalysisTemplate = analysisTemplatesService;
export const User = authService;
export const Task = tasksService;

// Also export the services directly
export {
  authService,
  clientsService,
  samplesService,
  workOrdersService,
  workflowsService,
  analysisService,
  analysisTemplatesService,
  quotesService,
  tasksService,
};