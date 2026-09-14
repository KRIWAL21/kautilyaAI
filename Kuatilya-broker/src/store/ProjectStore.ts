import { defineStore } from 'pinia'
import { ref } from 'vue'
import { makeRequest } from '@/request/request.ts'
import type { Project, CreateProjectPayload, AddCollateralPayload, UpdateSpotsPayload } from '@/types/project'

export const useProjectStore = defineStore('builderProjects', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get company ID from localStorage (set during builder login)
  function getCompanyId(): string {
    return localStorage.getItem('companyId') || ''
  }

  // -- Fetch builder own projects -----------------------------
  async function fetchBuilderProjects() {
    isLoading.value = true
    error.value = null
    try {
      const companyId = getCompanyId()
      const res = await makeRequest('/projects/builder/mine', 'GET', {}, {}, { companyId }, 0)
      projects.value = res.data || []
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Failed to load projects'
      console.error('[ProjectStore] fetchBuilderProjects:', e)
    } finally {
      isLoading.value = false
    }
  }

  // -- Fetch single project -----------------------------------
  async function fetchProject(id: string) {
    isLoading.value = true
    error.value = null
    try {
      const res = await makeRequest(`/projects/${id}`, 'GET', {}, {}, {}, 0)
      currentProject.value = res.data
      return res.data as Project
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Failed to load project'
      console.error('[ProjectStore] fetchProject:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // -- Create project -----------------------------------------
  async function createProject(payload: CreateProjectPayload): Promise<Project> {
    isLoading.value = true
    error.value = null
    try {
      const companyId = getCompanyId()
      const res = await makeRequest('/projects', 'POST', payload, {}, { companyId }, 0)
      const created = res.data as Project
      projects.value.unshift(created)
      return created
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Failed to create project'
      console.error('[ProjectStore] createProject:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // -- Update project -----------------------------------------
  async function updateProject(id: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
    isLoading.value = true
    try {
      const res = await makeRequest(`/projects/${id}`, 'PUT', payload, {}, {}, 0)
      const updated = res.data as Project
      const idx = projects.value.findIndex(p => p._id === id)
      if (idx !== -1) projects.value[idx] = updated
      if (currentProject.value?._id === id) currentProject.value = updated
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Failed to update project'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // -- Add collateral -----------------------------------------
  async function addCollateral(projectId: string, payload: FormData): Promise<Project> {
    try {
      const res = await makeRequest(`/projects/${projectId}/collateral`, 'POST', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }, {}, 0)
      const updated = res.data as Project
      if (currentProject.value?._id === projectId) currentProject.value = updated
      return updated
    } catch (e: any) {
      console.error('[ProjectStore] addCollateral:', e)
      throw e
    }
  }

  // -- Update spots -------------------------------------------
  async function updateSpots(projectId: string, collateralId: string, payload: UpdateSpotsPayload): Promise<Project> {
    try {
      const res = await makeRequest(`/projects/${projectId}/collateral/${collateralId}/spots`, 'PUT', payload, {}, {}, 0)
      const updated = res.data as Project
      if (currentProject.value?._id === projectId) currentProject.value = updated
      return updated
    } catch (e: any) {
      console.error('[ProjectStore] updateSpots:', e)
      throw e
    }
  }

  // -- Delete collateral --------------------------------------
  async function removeCollateral(projectId: string, collateralId: string): Promise<Project> {
    try {
      const res = await makeRequest(`/projects/${projectId}/collateral/${collateralId}`, 'DELETE', {}, {}, {}, 0)
      const updated = res.data as Project
      if (currentProject.value?._id === projectId) currentProject.value = updated
      return updated
    } catch (e: any) {
      console.error('[ProjectStore] removeCollateral:', e)
      throw e
    }
  }

  return {
    projects,
    currentProject,
    isLoading,
    error,
    fetchBuilderProjects,
    fetchProject,
    createProject,
    updateProject,
    addCollateral,
    updateSpots,
    removeCollateral,
  }
})
