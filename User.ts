import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Role } from './Role';
import { Order } from './Order';
import { SalesTarget } from './SalesTarget';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password_hash: string;

    @Column({ type: 'nvarchar', length: 255, nullable: true })
    full_name: string;

    @Column()
    role_id: number;

    @ManyToOne(() => Role, role => role.users, { eager: true }) // Eager load role for easy access
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @CreateDateColumn({ type: 'datetime2', default: () => 'GETUTCDATE()' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime2', default: () => 'GETUTCDATE()', onUpdate: 'GETUTCDATE()' })
    updated_at: Date;

    @OneToMany(() => Order, order => order.sales_person)
    orders: Order[];

    @OneToMany(() => SalesTarget, target => target.user)
    sales_targets: SalesTarget[];

    // Hash password before inserting or updating
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        // Only hash if password is provided and not already a hash (simple check)
        if (this.password_hash && !this.password_hash.startsWith('$2b$')) {
            const saltRounds = 10;
            this.password_hash = await bcrypt.hash(this.password_hash, saltRounds);
        }
    }

    // Method to compare password (useful in services)
    async comparePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password_hash);
    }
}

