import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Order } from './Order';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn()
    customer_id: number;

    @Column({ type: 'nvarchar', length: 255 })
    customer_name: string;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    phone: string;

    @Column({ type: 'nvarchar', length: 500, nullable: true })
    address: string;

    @Column({ type: 'nvarchar', length: 100, nullable: true })
    city: string;

    @Column({ type: 'nvarchar', length: 100, nullable: true })
    region: string; // Used for sales by region chart

    @Column({ type: 'nvarchar', length: 100, nullable: true })
    country: string;

    @CreateDateColumn({ type: 'datetime2', default: () => 'GETUTCDATE()' })
    created_at: Date;

    @OneToMany(() => Order, order => order.customer)
    orders: Order[];
}

