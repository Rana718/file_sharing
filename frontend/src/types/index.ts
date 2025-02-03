export interface FileChunkMessage {
    type: string;
    roomId: string;
    fileData: string;
    chunkIndex: number;
    totalChunks: number;
    isLastChunk: boolean;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    isFirstChunk?: boolean;
}


