const Feature = [
    { title: "No Registration", desc: "Start sharing files instantly without creating an account" },
    { title: "No File Limits", desc: "Share files of any size without restrictions" },
    { title: "Secure Sharing", desc: "Private room keys ensure your files reach the right person" },
    { title: "Quick & Easy", desc: "Simple interface for hassle-free file sharing" }
]

const FormatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};


export {
    Feature,
    FormatFileSize
}