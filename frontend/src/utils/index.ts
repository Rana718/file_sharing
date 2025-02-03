const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;

    const sizeInKB = bytes / 1024;
    if (sizeInKB < 1024) return `${sizeInKB.toFixed(2)} KB`;

    const sizeInMB = sizeInKB / 1024;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(2)} MB`;

    const sizeInGB = sizeInMB / 1024;
    return `${sizeInGB.toFixed(2)} GB`;
};

export { formatFileSize };
