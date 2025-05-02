import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';

@Entity('sales_targets')
@Unique(['user_id', 'target_month']) // Ensure one target per user per month
export class SalesTarget {
    @PrimaryGeneratedColumn()
    target_id: number;

    @Column()
    user_id: number; // Associated salesperson

    @Column({ type: 'date' }) // Store only the date part, representing the first day of the month
    target_month: string; // Format 'YYYY-MM-DD'

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    target_amount: number;

    @CreateDateColumn({ type: 'datetime2', default: () => 'GETUTCDATE()' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime2', default: () => 'GETUTCDATE()', onUpdate: 'GETUTCDATE()' })
    updated_at: Date;

    @ManyToOne(() => User, user => user.sales_targets)
    @JoinColumn({ name: 'user_id' })
    user: User;
}

