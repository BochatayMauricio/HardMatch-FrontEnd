export interface NotificationI {
    id:number;
    title:string;
    explanation:string;
    isRead: boolean;
    userId: number;
    actionUrl?: string;
    createdAt:Date;
    updatedAt:Date;
}
