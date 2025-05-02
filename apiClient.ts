import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token JWT às requisições
apiClient.interceptors.request.use(
    (config) => {
        // Tenta obter o token do localStorage (ou de onde quer que ele seja armazenado após o login)
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para lidar com erros de resposta (ex: 401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token inválido ou expirado
            console.error('Unauthorized access - 401');
            // Limpa o token local
            localStorage.removeItem('authToken');
            // Redireciona para a página de login
            // Certifique-se de que isso só roda no lado do cliente
            if (typeof window !== 'undefined') {
                // Poderia usar router.push('/login') se estiver dentro de um componente Next.js
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

