/**
 * API Integrations
 * 
 * Provides integration services for email, file handling, AI, etc.
 */

import apiClient from './client';
import { filesService } from './services';

// Email service
export const SendEmail = async (emailData) => {
  const response = await apiClient.post('/integrations/email/send', emailData);
  return response.data;
};

// File upload (delegates to filesService)
export const UploadFile = async (file, metadata = {}) => {
  return filesService.upload(file, metadata);
};

// Private file upload
export const UploadPrivateFile = async (file, metadata = {}) => {
  const privateMetadata = { ...metadata, isPrivate: true };
  return filesService.upload(file, privateMetadata);
};

// Create signed URL for file access
export const CreateFileSignedUrl = async (fileId, expiresIn = 3600) => {
  return filesService.getSignedUrl(fileId, expiresIn);
};

// AI/LLM integration
export const InvokeLLM = async (prompt, options = {}) => {
  const response = await apiClient.post('/integrations/ai/invoke', {
    prompt,
    ...options,
  });
  return response.data;
};

// Image generation
export const GenerateImage = async (prompt, options = {}) => {
  const response = await apiClient.post('/integrations/ai/generate-image', {
    prompt,
    ...options,
  });
  return response.data;
};

// Extract data from uploaded files (OCR, PDF parsing, etc.)
export const ExtractDataFromUploadedFile = async (fileId, options = {}) => {
  const response = await apiClient.post(`/integrations/files/${fileId}/extract`, options);
  return response.data;
};

// Core integrations object for backward compatibility
export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile,
  CreateFileSignedUrl,
  UploadPrivateFile,
};






