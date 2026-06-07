const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL";
const SERVICE_ROLE_KEY = "PASTE_YOUR_SERVICE_ROLE_KEY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PROOF_BUCKET = "task-proofs";

async function cleanupProofs() {
    console.log("Fetching proof records...");

    const { data: proofs, error: fetchError } = await supabase
        .from("matrix_task_proofs")
        .select("id, assignment_id, file_path, storage_bucket");

    if (fetchError) {
        console.error("Fetch failed:", fetchError.message);
        return;
    }

    if (!proofs || proofs.length === 0) {
        console.log("No proof files found.");
        return;
    }

    const paths = proofs
        .map((proof) => proof.file_path)
        .filter(Boolean);

    console.log(`Found ${paths.length} proof files.`);

    for (let i = 0; i < paths.length; i += 100) {
        const batch = paths.slice(i, i + 100);

        const { error: removeError } = await supabase.storage
            .from(PROOF_BUCKET)
            .remove(batch);

        if (removeError) {
            console.error("Storage delete failed:", removeError.message);
            return;
        }

        console.log(`Deleted ${i + batch.length}/${paths.length} files`);
    }

    const assignmentIds = proofs
        .map((proof) => proof.assignment_id)
        .filter(Boolean);

    const { error: proofRowDeleteError } = await supabase
        .from("matrix_task_proofs")
        .delete()
        .in(
            "id",
            proofs.map((proof) => proof.id)
        );

    if (proofRowDeleteError) {
        console.error("Proof row delete failed:", proofRowDeleteError.message);
        return;
    }

    const { error: assignmentResetError } = await supabase
        .from("matrix_task_assignments")
        .update({
            proof_viewed_at: null,
            submitted_at: null,
            updated_at: new Date().toISOString(),
        })
        .in("id", assignmentIds)
        .in("status", ["submitted"]);

    if (assignmentResetError) {
        console.error("Assignment reset failed:", assignmentResetError.message);
        return;
    }

    console.log("Cleanup completed successfully.");
}

cleanupProofs();