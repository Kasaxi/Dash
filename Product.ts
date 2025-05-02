import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './OrderItem';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    product_id: number;

    @Column({ type: 'nvarchar', length: 255 })
    product_name: string;

    @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    price: number;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
    sku: string; // Stock Keeping Unit

    @Column({ type: 'nvarchar', length: 100, nullable: true })
    category: string;

    @CreateDateColumn({ type: 'datetime2', default: () => 'GETUTCDATE()' })
    created_at: Date;

    @OneToMany(() => OrderItem, orderItem => orderItem.product)
    order_items: OrderItem[];
}

