import axios from 'axios'

const instance = axios.create({
    baseURL:'http://localhost:4000',
    headers:{
        'Content-Type': 'application/json'
    },
    withCredentials:true
})

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

  instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
instance.interceptors.response.use(function (response) {
        //console.log('intercpert reponse',response)
    return response;
  }, function (error) {
    //console.log('intercpert reponse',error)
    return Promise.reject(error);
  });