import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './Order';
import { Product } from './Product';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn()
    order_item_id: number;

    @Column()
    order_id: number;

    @Column()
    product_id: number;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    unit_price: number; // Price at the time of purchase

    // total_price is a computed column in the DB, so we don't map it directly
    // If needed for calculations in backend, it can be added as a non-mapped property or calculated in services
    // @Column({ type: 'decimal', precision: 18, scale: 2, generated: 'AS (quantity * unit_price)' })
    // total_price: number; // TypeORM might have issues with complex generated columns depending on version/driver

    @ManyToOne(() => Order, order => order.order_items, { onDelete: 'CASCADE' }) // Cascade delete if order is deleted
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Product, product => product.order_items)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}

