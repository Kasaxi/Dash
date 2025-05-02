import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from './Customer';
import { User } from './User';
import { OrderItem } from './OrderItem';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    order_id: number;

    @Column()
    customer_id: number;

    @CreateDateColumn({ type: 'datetime2', default: () => 'GETUTCDATE()' })
    order_date: Date;

    @Column({ type: 'varchar', length: 50, default: 'Pending' })
    status: string; // Pending, Processing, Shipped, Delivered, Cancelled

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    total_amount: number;

    @Column({ nullable: true }) // Allow null if the sale wasn't directly attributed or system generated
    sales_person_id: number;

    @ManyToOne(() => Customer, customer => customer.orders)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => User, user => user.orders, { nullable: true }) // Allow null sales_person
    @JoinColumn({ name: 'sales_person_id' })
    sales_person: User;

    @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true }) // Cascade allows saving/deleting items with order
    order_items: OrderItem[];
}

