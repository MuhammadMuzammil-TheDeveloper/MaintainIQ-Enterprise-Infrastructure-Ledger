// Ensure the Supabase CDN script is loaded before this file runs
const { createClient } = window.supabase;

const SUPABASE_URL = "https://tiktxzfgbhlraahrgtuf.supabase.co"; // Your custom endpoint
const SUPABASE_ANON_KEY = "sb_publishable_yH5e7BamzgcalSuIgylsBw_qZAQP3eu"; // Replace with your actual Anon Key

// const SUPABASE_URL = "https://tiktxzfgbhlraahrgtuf.supabase.co";
// const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yH5e7BamzgcalSuIgylsBw_qZAQP3eu";


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Uploads a file to a Supabase Storage bucket and returns its public URL
 * @param {string} bucketName - Name of the storage bucket (e.g., 'evidence')
 * @param {File} fileObject - The file captured from an HTML input element
 */
export async function uploadMediaEvidenceFile(bucketName, fileObject) {
    if (!fileObject) return null;
    
    // Create a sanitized, unique filename to avoid collision blocks
    const fileExtension = fileObject.name.split('.').pop();
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
    
    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(uniqueFileName, fileObject, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error("Storage Engine Upload Exception:", error.message);
        throw error;
    }

    // Resolve the clean public web address path for DB entry persistence
    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uniqueFileName);

    return publicUrl;
}