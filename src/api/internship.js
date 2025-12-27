import request from '@/utils/request';

/**
 * Internship API
 */

// Get internships list with filters and pagination
export function getInternships(params) {
  return request({
    url: '/internships',
    method: 'get',
    params
  });
}

// Get internship detail by ID
export function getInternship(id) {
  return request({
    url: `/internships/${id}`,
    method: 'get'
  });
}

// Submit internship log (student only)
export function submitLog(internshipId, data) {
  return request({
    url: `/internships/${internshipId}/logs`,
    method: 'post',
    data
  });
}

// Get internship logs
export function getLogs(internshipId, params) {
  return request({
    url: `/internships/${internshipId}/logs`,
    method: 'get',
    params
  });
}

// Upload internship file (student only)
export function uploadFile(internshipId, formData) {
  return request({
    url: `/internships/${internshipId}/files`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Get internship files
export function getFiles(internshipId, params) {
  return request({
    url: `/internships/${internshipId}/files`,
    method: 'get',
    params
  });
}

// Submit teacher evaluation
export function submitTeacherEvaluation(internshipId, data) {
  return request({
    url: `/internships/${internshipId}/evaluate/teacher`,
    method: 'post',
    data
  });
}

// Submit enterprise evaluation
export function submitEnterpriseEvaluation(internshipId, data) {
  return request({
    url: `/internships/${internshipId}/evaluate/enterprise`,
    method: 'post',
    data
  });
}

// Get internship evaluation
export function getEvaluation(internshipId) {
  return request({
    url: `/internships/${internshipId}/evaluation`,
    method: 'get'
  });
}

export default {
  getInternships,
  getInternship,
  submitLog,
  getLogs,
  uploadFile,
  getFiles,
  submitTeacherEvaluation,
  submitEnterpriseEvaluation,
  getEvaluation
};
