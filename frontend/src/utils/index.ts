const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;

  const sizeInKB = bytes / 1024;
  if (sizeInKB < 1024) return `${sizeInKB.toFixed(2)} KB`;

  const sizeInMB = sizeInKB / 1024;
  if (sizeInMB < 1024) return `${sizeInMB.toFixed(2)} MB`;

  const sizeInGB = sizeInMB / 1024;
  return `${sizeInGB.toFixed(2)} GB`;
};

const formatTransferSpeed = (bytesPerSecond: number) => {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) {
    return "0 B/s";
  }

  return `${formatFileSize(bytesPerSecond)}/s`;
};

const formatEta = (seconds: number | null) => {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) {
    return "--";
  }

  const rounded = Math.ceil(seconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;

  if (mins === 0) return `${secs}s`;
  if (mins < 60) return `${mins}m ${secs}s`;

  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
};

export { formatFileSize, formatTransferSpeed, formatEta };
