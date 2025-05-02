import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './entities/User'; // Criaremos essas entidades depois
import { Role } from './entities/Role';
import { Customer } from './entities/Customer';
import { Product } from './entities/Product';
import { Order } from './entities/Order';
import { OrderItem } from './entities/OrderItem';
import { SalesTarget } from './entities/SalesTarget';

dotenv.config(); // Carrega variáveis do .env

// Validação básica das variáveis de ambiente
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Erro: Variável de ambiente ${varName} não está definida.`);
        process.exit(1);
    }
});

export const AppDataSourceOptions: DataSourceOptions = {
    type: 'mssql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '1433', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false, // Nunca usar true em produção! Usaremos migrações ou scripts SQL.
    logging: process.env.NODE_ENV === 'development' ? true : ['error'], // Log apenas em dev ou erros
    entities: [
        User,
        Role,
        Customer,
        Product,
        Order,
        OrderItem,
        SalesTarget
        // Adicione outras entidades aqui
        // Ex: path.join(__dirname, './entities/**/*.js') ou path.join(__dirname, './entities/**/*.ts')
    ],
    migrations: [
        // path.join(__dirname, './migrations/**/*.js') ou path.join(__dirname, './migrations/**/*.ts')
    ],
    subscribers: [],
    options: {
        encrypt: process.env.DB_OPTIONS?.includes('encrypt=true') ?? false, // Habilita criptografia
        trustServerCertificate: process.env.DB_OPTIONS?.includes('trustServerCertificate=true') ?? false, // Necessário para dev com certificado auto-assinado
        // Outras opções do mssql podem ser adicionadas aqui
        // Exemplo: requestTimeout: 30000
    },
    extra: {
        // Configurações extras específicas do driver, se necessário
    }
};

export const AppDataSource = new DataSource(AppDataSourceOptions);

// Função para inicializar a conexão
export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Conexão com o banco de dados SQL Server inicializada com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar a conexão com o banco de dados:', error);
        process.exit(1); // Encerra a aplicação se não conseguir conectar
    }
};

