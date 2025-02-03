const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
};


const base64ToUint8Array = (base64: string): Uint8Array => {
    const fixedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = fixedBase64.padEnd(fixedBase64.length + (4 - fixedBase64.length % 4) % 4, '=');
    const binary = atob(paddedBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

export { arrayBufferToBase64, base64ToUint8Array };