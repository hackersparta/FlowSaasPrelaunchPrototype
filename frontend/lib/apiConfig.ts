// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiConfig = {
    baseURL: API_URL,
    endpoints: {
        auth: {
            login: `${API_URL}/auth/login`,
            signup: `${API_URL}/auth/register`,
            me: `${API_URL}/auth/me`,
        },
        automations: {
            list: `${API_URL}/automations/user`,
            run: `${API_URL}/automations/run`,
            get: (id: string) => `${API_URL}/automations/${id}`,
            result: (id: string) => `${API_URL}/automations/${id}/result`,
            cancel: (id: string) => `${API_URL}/automations/${id}`,
        },
        tools: {
            list: `${API_URL}/tools/`,
            random: `${API_URL}/tools/random`,
            categories: `${API_URL}/tools/categories`,
            get: (slug: string) => `${API_URL}/tools/${slug}`,
            execute: (slug: string) => `${API_URL}/tools/${slug}/execute`,
            executeFile: (slug: string) => `${API_URL}/tools/${slug}/execute-file`,
        },
        templates: {
            list: `${API_URL}/templates`,
            get: (id: string) => `${API_URL}/templates/${id}`,
            run: (id: string) => `${API_URL}/templates/${id}/run`,
        },
        admin: {
            templates: {
                list: `${API_URL}/admin/templates`,
                upload: `${API_URL}/admin/templates/upload`,
                get: (id: string) => `${API_URL}/admin/templates/${id}`,
                activate: (id: string) => `${API_URL}/admin/templates/${id}/activate`,
                deactivate: (id: string) => `${API_URL}/admin/templates/${id}/deactivate`,
                test: (id: string) => `${API_URL}/admin/templates/${id}/test`,
                delete: (id: string) => `${API_URL}/admin/templates/${id}`,
            },
            tools: {
                list: `${API_URL}/admin/tools/`,
                upload: `${API_URL}/admin/tools/upload`,
                activate: (id: string) => `${API_URL}/admin/tools/${id}/activate`,
                deactivate: (id: string) => `${API_URL}/admin/tools/${id}/deactivate`,
                delete: (id: string) => `${API_URL}/admin/tools/${id}`,
            },
        },
        payments: {
            packages: `${API_URL}/payments/packages`,
            createOrder: `${API_URL}/payments/create-order`,
            verify: `${API_URL}/payments/verify`,
        },
        executions: {
            list: `${API_URL}/executions/`,
        },
    },
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// Helper function for authenticated fetch
export const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    return fetch(url, {
        ...options,
        headers,
    });
};

export default apiConfig;
