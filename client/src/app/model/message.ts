export interface Message {
    text: string;
    sender: string;
    timestamp: Date;
    type: string;
    lyrics?: string;
    title?: string;
    image_url?: string;
}