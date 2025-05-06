import Cookies from 'js-cookie';

export const isAuthenticated = () => {
    return !!Cookies.get('token');
}

export const logout = () => {
    Cookies.remove('token');
    window.location.href = '/login';
}

export const getAuthHeader = () => {
    const token = Cookies.get('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const authenticatedFetch = async (url, options = {}) => {
    const token = Cookies.get('token');

    if(!token){
        logout();
        return Promise.reject("No auth token found");
    }

    const authOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        }
    }

    try{
        const response = await fetch(url, authOptions);

        if(response.status === 401){
            logout();
            return Promise.reject('Session expired');
        }

        return response;
    }catch(error){
        console.error('Request failed ' + error);
        throw error;
    }

}