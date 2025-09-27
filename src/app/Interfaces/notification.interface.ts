export interface NotificationI {
    id:number;
    title:string;
    explanation:string;
    isRead: boolean;
    userId: number;
    createdAt:Date;
    updatedAt:Date;
}