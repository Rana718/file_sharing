const formatFileSize = (base64String: string) => {
    const sizeInBytes = (base64String.length * 3) / 4;
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
};


export { formatFileSize };