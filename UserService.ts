import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { FindOneOptions } from "typeorm";

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async findByUsername(username: string): Promise<User | null> {
        const options: FindOneOptions<User> = {
            where: { username },
            relations: ["role"], // Load the role relationship
        };
        return this.userRepository.findOne(options);
    }

    async findByEmail(email: string): Promise<User | null> {
        const options: FindOneOptions<User> = {
            where: { email },
            relations: ["role"],
        };
        return this.userRepository.findOne(options);
    }

    async findById(userId: number): Promise<User | null> {
        const options: FindOneOptions<User> = {
            where: { user_id: userId },
            relations: ["role"],
        };
        return this.userRepository.findOne(options);
    }

    async createUser(userData: Partial<User>): Promise<User> {
        // Ensure role_id is provided or set a default if applicable
        if (!userData.role_id) {
            // Example: Default to 'viewer' or 'sales_person' role ID if not provided
            // const defaultRole = await AppDataSource.getRepository(Role).findOne({ where: { role_name: 'viewer' } });
            // if (defaultRole) userData.role_id = defaultRole.role_id;
            // For now, let's assume role_id is required from the controller
            if (!userData.role) {
                 throw new Error("Role information is required to create a user.");
            }
            userData.role_id = userData.role.role_id;
        }

        const newUser = this.userRepository.create(userData);
        // The password hashing is handled by the @BeforeInsert hook in the User entity
        await this.userRepository.save(newUser);
        // Reload to get the role relation properly populated if only role_id was passed
        return this.findById(newUser.user_id);
    }

    // Add other methods as needed, e.g., updateUser, deleteUser, listUsers (with pagination/filtering)
    async listUsers(options: { page?: number; limit?: number; roleName?: string } = {}): Promise<{ data: User[], total: number }> {
        const { page = 1, limit = 10, roleName } = options;
        const skip = (page - 1) * limit;

        const queryBuilder = this.userRepository.createQueryBuilder("user")
            .leftJoinAndSelect("user.role", "role")
            .skip(skip)
            .take(limit)
            .orderBy("user.user_id", "ASC");

        if (roleName) {
            queryBuilder.where("role.role_name = :roleName", { roleName });
        }

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
    }
}

