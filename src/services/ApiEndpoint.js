import axios from 'axios'

const instance = axios.create({
    //baseURL: 'http://localhost:4000',
    baseURL: 'https://ecbarko-back.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 10000
})

instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only set Content-Type to application/json if it's not already set
    // and if we're not sending FormData
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }
    
    // If it's FormData, let axios set the Content-Type with boundary automatically
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    
    return config;
}, function (error) {
    console.error('Request error:', error);
    return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
    if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token stored');
    }
    
    return response;
}, function (error) {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
        console.log('401 error - removing token');
        localStorage.removeItem('token');
    }
    
    return Promise.reject(error);
});

export const get = (url, params = {}) => instance.get(url, { params });
export const post = (url, data) => instance.post(url, data);
export const put = (url, data) => instance.put(url, data);
export const deleteUser = (url) => instance.delete(url);

export const sendEmail = (email) => instance.post('/api/admin/send-email', { email });
export const sendContactMessage = (data) => instance.post('/api/admin/contact-message', data);

export const getAboutContent = () => get('/api/admin/about');
export const updateAboutContent = (data) => put('/api/admin/about', data);

export const getHomeContent = () => get('/api/admin/home');
export const updateHomeContent = (data) => put('/api/admin/home', data);

export const getContactContent = () => get('/api/admin/contact');
export const updateContactContent = (data) => put('/api/admin/contact', data);

export const getAboutEBCContent = () => get('/api/admin/aboutEBC');
export const updateAboutEBCContent = (data) => put('/api/admin/aboutEBC', data);

export const getAboutAppContent = () => get('/api/admin/aboutapp');
export const updateAboutAppContent = (data) => put('/api/admin/aboutapp', data);

export const getFaqs = () => get('/api/admin/faqs');
export const createFaq = (data) => post('/api/admin/faqs', data);
export const updateFaq = (id, data) => put(`/api/admin/faqs/${id}`, data);
export const deleteFaq = (id) => deleteUser(`/api/admin/faqs/${id}`);

export const getPassengerFares = () => get('/api/sa-fares');
export const addPassengerFare = (data) => post('/api/sa-fares', data);
export const updatePassengerFare = (id, data) => put(`/api/sa-fares/${id}`, data);

// Export the instance for special cases
export default instance;