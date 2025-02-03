import { FiDownload, FiSend, FiShield, FiZap } from "react-icons/fi";

const Feature = [
    { title: "No Registration", desc: "Start sharing files instantly without creating an account, making it quick and hassle-free." },
    { title: "No File Limits", desc: "Share files of any size without restrictions, ensuring seamless transfers for large documents, videos, and more." },
    { title: "No User Limits", desc: "Invite as many people as you want to your file-sharing session without any restrictions on the number of users." },
    { title: "Secure Sharing", desc: "Private room keys and encrypted transfers ensure your files reach the right person without compromise." },
    { title: "Quick & Easy", desc: "A simple, user-friendly interface allows for hassle-free file sharing in just a few clicks." },
    { title: "End-to-End Encryption", desc: "Your files remain fully encrypted during transfer, ensuring data security and privacy." },
    { title: "Multi-Device Support", desc: "Access and share your files across multiple devices, whether on mobile, tablet, or desktop." },
    { title: "Drag & Drop Uploads", desc: "Easily upload and share files by simply dragging and dropping them into the interface." },
    { title: "Real-Time Transfers", desc: "Enjoy lightning-fast file transfers with minimal wait time, even for large files." },
    { title: "Cross-Platform Compatibility", desc: "Works seamlessly on all major browsers and operating systems, ensuring a smooth experience for everyone." }
];

const Icons = [
    { icon: <FiZap />, text: "Instant Transfer" },
    { icon: <FiShield />, text: "End-to-End Encrypted" },
    { icon: <FiDownload />, text: "No Size Limits" },
    { icon: <FiSend />, text: "Direct P2P" },
]



export {
    Feature,
    Icons
}