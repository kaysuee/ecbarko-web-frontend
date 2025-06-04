import axios from 'axios'

const instance = axios.create({
    baseURL: 'https://ecbarko-back.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 10000
})

// Add request interceptor to include token
instance.interceptors.request.use(function (config) {
    console.log('Making request to:', config.baseURL + config.url);
    
    // Add token to headers if it exists
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, function (error) {
    console.error('Request error:', error);
    return Promise.reject(error);
});

// Add response interceptor for debugging and token handling
instance.interceptors.response.use(function (response) {
    console.log('Response received:', response.status, response.data);
    
    // Store token if provided in response
    if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    
    return response;
}, function (error) {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Handle 401 errors (token expired/invalid)
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        // Optionally redirect to login
        // window.location.href = '/login';
    }
    
    return Promise.reject(error);
});

export const get = (url, params = {}) => instance.get(url, { params });
export const post = (url, data) => instance.post(url, data);
export const put = (url, data) => instance.put(url, data);
export const deleteUser = (url) => instance.delete(url);

export const sendEmail = (email) => instance.post('/api/admin/send-email', { email });
export const sendContactMessage = (data) => instance.post('/api/admin/contact-message', data);

/////// About Content APIs
export const getAboutContent = () => get('/api/admin/about');
export const updateAboutContent = (data) => put('/api/admin/about', data);

/////// home Content APIs
export const getHomeContent = () => get('/api/admin/home');
export const updateHomeContent = (data) => put('/api/admin/home', data);

/////// contact Content APIs
export const getContactContent = () => get('/api/admin/contact');
export const updateContactContent = (data) => put('/api/admin/contact', data);

/////// about ebc Content APIs
export const getAboutEBCContent = () => get('/api/admin/aboutEBC');
export const updateAboutEBCContent = (data) => put('/api/admin/aboutEBC', data);