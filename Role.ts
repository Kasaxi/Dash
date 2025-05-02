import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './User';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    role_id: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    role_name: string; // admin, sales_manager, viewer, sales_person

    @OneToMany(() => User, user => user.role)
    users: User[];
}

