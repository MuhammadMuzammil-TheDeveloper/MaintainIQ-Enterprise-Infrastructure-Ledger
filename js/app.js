import { supabase, uploadMediaEvidenceFile } from './db.js';
import { SafeMockAIService } from './ai.js';
import { UI } from './utils.js';

// Application State Matrix
let activeSessionProfile = null;
let cachedAssetsStore = [];
let cachedIssuesStore = [];
let cachedTechnicianProfilesStore = [];

// Determine context based on URL file target path string anchors
const routingHashAnchor = window.location.pathname.split('/').pop();

document.addEventListener("DOMContentLoaded", async () => {
    try {
        if (routingHashAnchor === "public.html") {
            await runPublicNodeExecutionFlow();
        } else {
            await runAuthenticatedPortalExecutionFlow();
        }
    } catch (criticalInitializationError) {
        console.error("Critical Main Core Platform Exception Matrix:", criticalInitializationError);
    }
});

/* ==========================================================================
   AUTHENTICATED INTERNAL PORTAL ENGINE ARCHITECTURE
   ========================================================================== */
async function runAuthenticatedPortalExecutionFlow() {
    setupPortalNavigationDOM();
    setupAuthFormSubmissions();
    
    // Core Persistent Session Verification Check
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        document.getElementById("auth-view").classList.remove("d-none");
        document.getElementById("portal-view").classList.add("d-none");
    } else {
        await fetchAndSynchronizeUserProfile(session.user.id);
    }

    // Bind Live System Interface Input Interception Engines
    document.getElementById("search-asset")?.addEventListener("input", renderAssetsDataMatrixTable);
    document.getElementById("filter-asset-category")?.addEventListener("change", renderAssetsDataMatrixTable);
    document.getElementById("filter-asset-status")?.addEventListener("change", renderAssetsDataMatrixTable);
    document.getElementById("search-issue")?.addEventListener("input", renderIssuesDataMatrixTable);
    document.getElementById("filter-issue-priority")?.addEventListener("change", renderIssuesDataMatrixTable);

    setupAssetLifecycleForm();
    setupRemediationWorkflowForm();
}

async function fetchAndSynchronizeUserProfile(userId) {
    try {
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
            
        if (error || !profile) {
            await supabase.auth.signOut();
            UI.showToast("Security Exception: Profiles table integration mapping missing.", "danger");
            window.location.reload();
            return;
        }
        
        activeSessionProfile = profile;
        displayAuthenticatedUserContext();
    } catch (err) {
        UI.showToast("Error authenticating application session tracking tokens.", "danger");
    }
}

function displayAuthenticatedUserContext() {
    document.getElementById("auth-view").classList.add("d-none");
    document.getElementById("portal-view").classList.remove("d-none");
    
    // Update active UI identity elements
    document.getElementById("user-display-name").textContent = activeSessionProfile.full_name;
    document.getElementById("user-display-role").textContent = activeSessionProfile.role;
    document.getElementById("user-avatar").textContent = activeSessionProfile.full_name.charAt(0).toUpperCase();
    document.getElementById("role-badge").textContent = `Role Privilege Tier: ${activeSessionProfile.role.toUpperCase()}`;
    
    // Enforce role-based element presentation layers
    if (activeSessionProfile.role === "admin") {
        document.querySelectorAll(".admin-action").forEach(el => el.classList.remove("d-none"));
    } else {
        document.querySelectorAll(".admin-action").forEach(el => el.remove());
    }
    
    // Fire full core operational database queries pipeline loops
    refreshPipelineDashboardMetrics();
}

async function refreshPipelineDashboardMetrics() {
    try {
        const tableBody = document.getElementById("assets-table-body");
        if (tableBody) UI.applyTableSkeleton(tableBody, 6);

        // Build the issues query. This is the fix for technicians seeing every
        // ticket: previously every logged-in user (admin OR technician) ran the
        // exact same unfiltered "select * from issues" query, so the dashboard
        // table always contained the full issue list no matter who was signed in.
        //
        // NOTE: this .eq() filter is a defense-in-depth / UX convenience layer.
        // The authoritative restriction MUST live in the Supabase RLS policy on
        // the "issues" table (see the accompanying SQL) — otherwise a technician
        // could still read other technicians' issues directly via the API.
        let issuesQuery = supabase
            .from("issues")
            .select("*, assets(name, asset_code)")
            .order("created_at", { ascending: false });

        if (activeSessionProfile.role === "technician") {
            issuesQuery = issuesQuery.eq("assigned_technician_id", activeSessionProfile.id);
        }

        // Asynchronously fetch live snapshots
        const [assetsResponse, issuesResponse, technicianProfilesResponse] = await Promise.all([
            supabase.from("assets").select("*").order("created_at", { ascending: false }),
            issuesQuery,
            activeSessionProfile.role === "admin"
                ? supabase.from("profiles").select("id, full_name").eq("role", "technician")
                : Promise.resolve({ data: [] })
        ]);

        cachedAssetsStore = assetsResponse.data || [];
        cachedIssuesStore = issuesResponse.data || [];
        cachedTechnicianProfilesStore = technicianProfilesResponse.data || [];

        // Execute operational interface updates
        buildAnalyticsSummaryCards();
        populateDomainCategoryFilters();
        renderAssetsDataMatrixTable();
        renderIssuesDataMatrixTable();
    } catch (err) {
        console.error("refreshPipelineDashboardMetrics failure:", err);
        UI.showToast("Fatal processing exception pulling data pipelines.", "danger");
    }
}

function buildAnalyticsSummaryCards() {
    const container = document.getElementById("analytics-summary-cards");
    if (!container) return;
    
    const operationalCount = cachedAssetsStore.filter(a => a.status === "Operational").length;
    const reportedIssuesCount = cachedIssuesStore.filter(i => i.status !== "Resolved" && i.status !== "Closed").length;
    const highRiskPriorityCount = cachedIssuesStore.filter(i => (i.priority === "High" || i.priority === "Critical") && i.status !== "Resolved").length;

    container.innerHTML = `
        <div class="col-md-4">
            <div class="glass-card p-3 border-start border-4 border-success">
                <small class="text-uppercase text-muted fw-bold">Operational Nodes Index</small>
                <h2 class="fw-bold text-success mb-0 mt-1">${operationalCount} / ${cachedAssetsStore.length}</h2>
            </div>
        </div>
        <div class="col-md-4">
            <div class="glass-card p-3 border-start border-4 border-warning">
                <small class="text-uppercase text-muted fw-bold">Active Open Incident Work Orders</small>
                <h2 class="fw-bold text-warning mb-0 mt-1">${reportedIssuesCount}</h2>
            </div>
        </div>
        <div class="col-md-4">
            <div class="glass-card p-3 border-start border-4 border-danger">
                <small class="text-uppercase text-muted fw-bold">Critical Vector Threshold Threats</small>
                <h2 class="fw-bold text-danger mb-0 mt-1">${highRiskPriorityCount}</h2>
            </div>
        </div>
    `;
}

function populateDomainCategoryFilters() {
    const select = document.getElementById("filter-asset-category");
    if (!select) return;
    const categories = [...new Set(cachedAssetsStore.map(a => a.category))];
    select.innerHTML = `<option value="">All Functional Domains</option>` + 
        categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderAssetsDataMatrixTable() {
    const body = document.getElementById("assets-table-body");
    if (!body) return;
    
    const searchVal = document.getElementById("search-asset").value.toLowerCase();
    const catVal = document.getElementById("filter-asset-category").value;
    const statusVal = document.getElementById("filter-asset-status").value;

    const filtered = cachedAssetsStore.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchVal) || asset.asset_code.toLowerCase().includes(searchVal);
        const matchesCat = !catVal || asset.category === catVal;
        const matchesStatus = !statusVal || asset.status === statusVal;
        return matchesSearch && matchesCat && matchesStatus;
    });

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No infrastructure asset nodes match active filters.</td></tr>`;
        return;
    }

    body.innerHTML = filtered.map(asset => {
        let statusColor = "bg-success text-white";
        if (asset.status === "Issue Reported") statusColor = "bg-warning text-dark";
        if (asset.status === "Under Maintenance" || asset.status === "Under Inspection") statusColor = "bg-info text-dark";
        if (asset.status === "Out of Service") statusColor = "bg-danger text-white";

        return `
            <tr>
                <td>
                    <div class="fw-bold text-dark">${asset.name}</div>
                    <small class="font-monospace text-secondary">${asset.asset_code}</small>
                </td>
                <td>${asset.category}<br><small class="text-muted">${asset.location}</small></td>
                <td><span class="badge ${statusColor}">${asset.status}</span></td>
                <td><span class="text-uppercase fw-bold small text-secondary">${asset.condition}</span></td>
                <td>${asset.next_service ? new Date(asset.next_service).toLocaleDateString() : 'Unscheduled'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-light border inspection-trigger-btn" data-id="${asset.id}"><i class="bi bi-eye-fill"></i> Inspect Matrix</button>
                </td>
            </tr>
        `;
    }).join('');

    body.querySelectorAll(".inspection-trigger-btn").forEach(btn => {
        btn.addEventListener("click", () => renderAssetDetailsTargetModal(btn.getAttribute("data-id")));
    });
}

async function renderAssetDetailsTargetModal(assetUuid) {
    const asset = cachedAssetsStore.find(a => a.id === assetUuid);
    if (!asset) return;

    document.getElementById("detail-asset-title").textContent = asset.name;
    document.getElementById("detail-asset-code").textContent = asset.asset_code;
    document.getElementById("detail-asset-cat").textContent = asset.category;
    document.getElementById("detail-asset-loc").textContent = asset.location;
    document.getElementById("detail-asset-status").innerHTML = `<span class="badge bg-secondary">${asset.status}</span>`;
    document.getElementById("detail-asset-cond").textContent = asset.condition;
    document.getElementById("detail-asset-next").textContent = asset.next_service ? new Date(asset.next_service).toLocaleDateString() : 'Continuous Operations';
    
    const notesEl = document.getElementById("detail-asset-notes");
    if (notesEl) notesEl.textContent = asset.admin_notes || "No privileged administrative logs present.";

    // Realize public route references deterministically
    const rootPathLocation = window.location.href.split('index.html')[0].split('?')[0];
    const generatedPublicNodeAddress = `${rootPathLocation}public.html?asset_code=${asset.asset_code}`;

    // Fix applied for qrcode-generator logic context mapping engines
    const qrContainer = document.getElementById("detail-qr-box");
    qrContainer.innerHTML = "";
    
    try {
        if (window.qrcode) {
            const qr = window.qrcode(4, 'L');
            qr.addData(generatedPublicNodeAddress);
            qr.make();
            qrContainer.innerHTML = qr.createImgTag(4); 
            
            const generatedImg = qrContainer.querySelector('img');
            if (generatedImg) {
                generatedImg.style.width = "140px";
                generatedImg.style.height = "140px";
                generatedImg.id = "active-qr-img-node";
                
                document.getElementById("download-qr-btn").onclick = () => {
                    const link = document.createElement('a');
                    link.download = `QR_${asset.asset_code}.png`;
                    link.href = generatedImg.src;
                    link.click();
                };
            }
        } else if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
            const canvasElement = document.createElement("canvas");
            qrContainer.appendChild(canvasElement);
            window.QRCode.toCanvas(canvasElement, generatedPublicNodeAddress, { width: 140, margin: 1 }, (err) => {
                if (err) console.error("Canvas Vector Processing Fault:", err);
            });
            
            document.getElementById("download-qr-btn").onclick = () => {
                const link = document.createElement('a');
                link.download = `QR_${asset.asset_code}.png`;
                link.href = canvasElement.toDataURL();
                link.click();
            };
        } else {
            // Dynamic API engine fallback layers
            qrContainer.innerHTML = `<img id="active-qr-img-node" src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(generatedPublicNodeAddress)}" alt="QR" />`;
            document.getElementById("download-qr-btn").onclick = () => {
                window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedPublicNodeAddress)}`, '_blank');
            };
        }
    } catch(qrError) {
        console.error("QR Code Execution Error Matrix Drop:", qrError);
        qrContainer.innerHTML = "<span class='text-danger small'>Failed to generate QR Matrix</span>";
    }

    document.getElementById("copy-public-link-btn").onclick = async () => {
        await navigator.clipboard.writeText(generatedPublicNodeAddress);
        UI.showToast("Secure remote public link reference copied to current clipboard context.");
    };

    document.getElementById("view-public-node-btn").href = generatedPublicNodeAddress;

    // Pull full transaction tracking array datasets securely
    const { data: historyArray } = await supabase
        .from("asset_history")
        .select("*")
        .eq("asset_id", asset.id)
        .order("created_at", { ascending: false });

    const timelineContainer = document.getElementById("asset-timeline-flow");
    if (historyArray && historyArray.length > 0) {
        timelineContainer.innerHTML = historyArray.map(h => `
            <div class="timeline-node">
                <small class="text-primary d-block fw-bold" style="font-size:0.75rem;">${new Date(h.created_at).toLocaleString()}</small>
                <span class="text-dark fw-semibold small d-block">${h.action}</span>
                <p class="mb-0 text-muted small" style="font-size:0.7rem;">Agent: ${h.actor_name} | State Snapshot: <span class="badge bg-light text-dark border">${h.status_snapshot}</span></p>
            </div>
        `).join('');
    } else {
        timelineContainer.innerHTML = `<p class="text-muted small py-2">No historical verification vectors captured on database grid layer.</p>`;
    }

    new window.bootstrap.Modal(document.getElementById("assetDetailsModal")).show();
}

function setupAssetLifecycleForm() {
    const form = document.getElementById("asset-form");
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("save-asset-btn");
        btn.disabled = true;

        const payload = {
            asset_code: document.getElementById("asset-form-code").value.trim(),
            name: document.getElementById("asset-form-name").value.trim(),
            category: document.getElementById("asset-form-category").value.trim(),
            location: document.getElementById("asset-form-location").value.trim(),
            condition: document.getElementById("asset-form-condition").value,
            status: document.getElementById("asset-form-status").value,
            last_service: document.getElementById("asset-form-last-service").value || null,
            next_service: document.getElementById("asset-form-next-service").value || null,
            admin_notes: document.getElementById("asset-form-notes").value.trim(),
            created_by: activeSessionProfile.id
        };

        try {
            const { data, error } = await supabase.from("assets").insert(payload).select().single();
            if (error) {
                if (error.code === "23505") throw new Error("Validation Exception: This unique asset code signature is already registered.");
                throw error;
            }

            // Automate first initialization index log context inside immutable records schema
            await supabase.from("asset_history").insert({
                asset_id: data.id,
                action: "Asset Registered in Database",
                actor_name: activeSessionProfile.full_name,
                status_snapshot: data.status
            });

            UI.showToast("System infrastructure entity provisioned successfully.");
            window.bootstrap.Modal.getInstance(document.getElementById("assetModal")).hide();
            form.reset();
            await refreshPipelineDashboardMetrics();
        } catch (err) {
            UI.showToast(err.message, "danger");
        } finally {
            btn.disabled = false;
        }
    });
}

function resolveAssignedTechnicianLabel(technicianId) {
    if (!technicianId) return "Unassigned Operations Allocation";

    // Admin has the full technician roster loaded; show the real name.
    const match = cachedTechnicianProfilesStore.find(t => t.id === technicianId);
    if (match) return `Assigned: ${match.full_name}`;

    // A technician viewing their own dashboard only ever has their own issues
    // in cachedIssuesStore (query is scoped server-side), so this is always them.
    if (activeSessionProfile.role === "technician" && technicianId === activeSessionProfile.id) {
        return `Assigned: ${activeSessionProfile.full_name}`;
    }

    return "Field Technician Active";
}

function renderIssuesDataMatrixTable() {
    const body = document.getElementById("issues-table-body");
    if (!body) return;

    const searchVal = document.getElementById("search-issue").value.toLowerCase();
    const priorityVal = document.getElementById("filter-issue-priority").value;

    const filtered = cachedIssuesStore.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchVal) || issue.assets?.name.toLowerCase().includes(searchVal);
        const matchesPriority = !priorityVal || issue.priority === priorityVal;
        return matchesSearch && matchesPriority;
    });

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No operational field issues identified matching input profiles.</td></tr>`;
        return;
    }

    body.innerHTML = filtered.map(issue => `
        <tr>
            <td>
                <div class="fw-bold text-dark">${issue.title}</div>
                <small class="text-muted">Ticket Protocol Reference: #${issue.issue_number}</small>
            </td>
            <td>${issue.assets?.name || 'Unlinked Data Anchor'}</td>
            <td><span class="badge bg-danger">${issue.priority}</span></td>
            <td><span class="badge bg-secondary">${issue.status}</span></td>
            <td><i class="bi bi-person-badge me-1"></i> ${resolveAssignedTechnicianLabel(issue.assigned_technician_id)}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-primary action-issue-trigger-btn" data-id="${issue.id}" data-asset="${issue.asset_id}"><i class="bi bi-gear-fill"></i> Orchestrate Pipeline</button>
            </td>
        </tr>
    `).join('');

    body.querySelectorAll(".action-issue-trigger-btn").forEach(btn => {
        btn.addEventListener("click", () => triggerIssueOperationalActionModal(btn.getAttribute("data-id"), btn.getAttribute("data-asset")));
    });
}

async function triggerIssueOperationalActionModal(issueUuid, assetUuid) {
    const issue = cachedIssuesStore.find(i => i.id === issueUuid);
    if (!issue) return;

    document.getElementById("action-issue-id").value = issueUuid;
    document.getElementById("action-asset-id").value = assetUuid;
    document.getElementById("action-issue-status").value = issue.status;

    if (activeSessionProfile.role === "admin") {
        const selectTech = document.getElementById("action-technician-assignee");
        if (selectTech) {
            const { data: techProfiles } = await supabase.from("profiles").select("*").eq("role", "technician");
            selectTech.innerHTML = `<option value="">Unassigned</option>` + 
                (techProfiles || []).map(t => `<option value="${t.id}">${t.full_name}</option>`).join('');
            selectTech.value = issue.assigned_technician_id || "";
        }
    }

    new window.bootstrap.Modal(document.getElementById("issueActionModal")).show();
}

function setupRemediationWorkflowForm() {
    const form = document.getElementById("issue-action-form");
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const issueUuid = document.getElementById("action-issue-id").value;
        const assetUuid = document.getElementById("action-asset-id").value;
        const targetStatus = document.getElementById("action-issue-status").value;
        
        let updatePayloadIssues = { status: targetStatus };
        
        if (activeSessionProfile.role === "admin") {
            const assignedTechVal = document.getElementById("action-technician-assignee").value;
            updatePayloadIssues.assigned_technician_id = assignedTechVal || null;
            if (assignedTechVal && targetStatus === "Reported") {
                updatePayloadIssues.status = "Assigned";
            }
        }

        try {
            // Commit structural ticket status changes
            await supabase.from("issues").update(updatePayloadIssues).eq("id", issueUuid);

            // Cascade core statuses back directly matching mapping state rules
            let mappingAssetStatus = "Issue Reported";
            if (targetStatus === "Inspection Started") mappingAssetStatus = "Under Inspection";
            if (targetStatus === "Maintenance In Progress" || targetStatus === "Waiting for Parts") mappingAssetStatus = "Under Maintenance";
            if (targetStatus === "Resolved" || targetStatus === "Closed") mappingAssetStatus = "Operational";
            if (targetStatus === "Reopened") mappingAssetStatus = "Issue Reported";

            await supabase.from("assets").update({ status: mappingAssetStatus }).eq("id", assetUuid);

            // Log technician field details safely into transaction schema
            const noteText = document.getElementById("action-notes").value.trim();
            const costVal = parseFloat(document.getElementById("action-cost").value) || 0;
            const partsText = document.getElementById("action-parts").value.trim();
            const fileInput = document.getElementById("action-evidence").files[0];

            if (noteText || costVal > 0 || fileInput) {
                let evidenceUrl = null;
                if (fileInput) {
                    evidenceUrl = await uploadMediaEvidenceFile("evidence", fileInput);
                }

                await supabase.from("maintenance_logs").insert({
                    issue_id: issueUuid,
                    asset_id: assetUuid,
                    technician_id: activeSessionProfile.id,
                    notes: noteText || "Operational phase modification entry.",
                    cost: costVal,
                    replacement_parts: partsText,
                    evidence_url: evidenceUrl
                });
            }

            // Synchronize execution metadata vectors directly inside structural histories
            await supabase.from("asset_history").insert({
                asset_id: assetUuid,
                issue_id: issueUuid,
                action: `Ticket Shifted to phase status: [${targetStatus}]`,
                actor_name: activeSessionProfile.full_name,
                status_snapshot: mappingAssetStatus
            });

            UI.showToast("Incident workflow core state matrix synchronized.");
            window.bootstrap.Modal.getInstance(document.getElementById("issueActionModal")).hide();
            form.reset();
            await refreshPipelineDashboardMetrics();
        } catch (err) {
            UI.showToast(err.message, "danger");
        }
    });
}

function setupPortalNavigationDOM() {
    const toggleLogin = document.getElementById("toggle-login-btn");
    const toggleRegister = document.getElementById("toggle-register-btn");
    const registerFields = document.getElementById("register-fields");
    const authSubmitBtn = document.getElementById("auth-submit-btn");

    toggleLogin?.addEventListener("click", () => {
        toggleLogin.classList.add("active", "btn-white", "shadow-sm");
        toggleLogin.classList.remove("btn-light");
        toggleRegister.classList.remove("active", "btn-white", "shadow-sm");
        toggleRegister.classList.add("btn-light");
        registerFields.classList.add("d-none");
        authSubmitBtn.innerHTML = 'Authenticate Session';
    });

    toggleRegister?.addEventListener("click", () => {
        toggleRegister.classList.add("active", "btn-white", "shadow-sm");
        toggleRegister.classList.remove("btn-light");
        toggleLogin.classList.remove("active", "btn-white", "shadow-sm");
        toggleLogin.classList.add("btn-light");
        registerFields.classList.remove("d-none");
        authSubmitBtn.innerHTML = 'Register New Identity';
    });

    document.getElementById("logout-trigger")?.addEventListener("click", async () => {
        await supabase.auth.signOut();
        window.location.reload();
    });
}

function setupAuthFormSubmissions() {
    const form = document.getElementById("auth-form");
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("auth-email").value.trim();
        const password = document.getElementById("auth-password").value;
        const submitBtn = document.getElementById("auth-submit-btn");
        const spinner = document.getElementById("auth-spinner");
        const isRegistering = document.getElementById("toggle-register-btn").classList.contains("active");

        submitBtn.disabled = true; spinner?.classList.remove("d-none");

        try {
            if (isRegistering) {
                const name = document.getElementById("auth-name").value.trim();
                const role = document.getElementById("auth-role").value;
                if (!name || password.length < 6) {
                    throw new Error("Validation Matrix Interruption: Passwords must contain at least 6 characters.");
                }
                const { error } = await supabase.auth.signUp({
                    email, password, options: { data: { full_name: name, role: role } }
                });
                if (error) throw error;
                UI.showToast("Registration successful. Core profile provisioned.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                UI.showToast("Credentials match. Initializing dashboard layout mapping matrices.");
            }
            window.location.reload();
        } catch (err) {
            UI.showToast(err.message, "danger");
            submitBtn.disabled = false; spinner?.classList.add("d-none");
        }
    });
}

/* ==========================================================================
   PUBLIC RADIAL NODE ANCHOR RECOVERY FLOWS (UNAUTHENTICATED)
   ========================================================================== */
async function runPublicNodeExecutionFlow() {
    const URLQueryParameters = new URLSearchParams(window.location.search);
    const resolvedAssetTokenCode = URLQueryParameters.get("asset_code");

    if (!resolvedAssetTokenCode) {
        document.getElementById("asset-not-found").classList.remove("d-none");
        return;
    }

    try {
        const { data: assetNode, error } = await supabase
            .from("assets")
            .select("*")
            .eq("asset_code", resolvedAssetTokenCode)
            .single();

        if (error || !assetNode) {
            document.getElementById("asset-not-found").classList.remove("d-none");
            return;
        }

        window.activePublicAssetReferenceNode = assetNode;
        renderPublicAssetNodeMetadata(assetNode);
        setupAIIncidentTriageAssistanceModule();
        setupPublicIncidentFormCommit();
    } catch (err) {
        document.getElementById("asset-not-found").classList.remove("d-none");
    }
}

async function renderPublicAssetNodeMetadata(assetNode) {
    document.getElementById("asset-content").classList.remove("d-none");
    document.getElementById("node-name").textContent = assetNode.name;
    document.getElementById("node-code").textContent = assetNode.asset_code;
    document.getElementById("node-category").textContent = assetNode.category;
    document.getElementById("node-location").textContent = assetNode.location;
    document.getElementById("node-condition").textContent = assetNode.condition;
    document.getElementById("node-last").textContent = assetNode.last_service ? new Date(assetNode.last_service).toLocaleDateString() : 'No data records tracking';
    document.getElementById("node-next").textContent = assetNode.next_service ? new Date(assetNode.next_service).toLocaleDateString() : 'Operational Clearance Continuous';

    const statusContainer = document.getElementById("node-status-container");
    statusContainer.innerHTML = `<span class="badge px-3 py-2 fs-6 bg-primary">${assetNode.status}</span>`;

    const { data: records } = await supabase
        .from("asset_history")
        .select("*")
        .eq("asset_id", assetNode.id)
        .order("created_at", { ascending: false });

    const stream = document.getElementById("node-public-timeline");
    if (records && records.length > 0) {
        stream.innerHTML = records.map(r => `
            <div class="timeline-node">
                <small class="text-muted d-block font-monospace" style="font-size:0.7rem;">${new Date(r.created_at).toLocaleDateString()}</small>
                <span class="text-dark small fw-bold">${r.action}</span>
            </div>
        `).join('');
    } else {
        stream.innerHTML = `<p class="text-muted small">Tracking history engine running cleanly.</p>`;
    }
}

// Fixed direct integration execution without AI interceptors
function setupAIIncidentTriageAssistanceModule() {
    const aiBtn = document.getElementById("trigger-ai-triage-btn");
    if (aiBtn) {
        aiBtn.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Open Issue Report Form';
        aiBtn.addEventListener("click", () => {
            const rawComplaintText = document.getElementById("nl-complaint").value.trim();
            
            // Direct input matrix form extraction and assignment
            document.getElementById("issue-description").value = rawComplaintText;
            document.getElementById("issue-title").value = `Issue reported on ${window.activePublicAssetReferenceNode.name}`;
            document.getElementById("issue-category").value = window.activePublicAssetReferenceNode.category;
            
            // Instantly render structural public form input components
            document.getElementById("public-issue-form").classList.remove("d-none");
        });
    }
}

function setupPublicIncidentFormCommit() {
    const form = document.getElementById("public-issue-form");
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("submit-issue-btn");
        submitBtn.disabled = true;

        const mediaFile = document.getElementById("issue-evidence").files[0];
        let uploadedEvidenceUrl = null;

        try {
            if (mediaFile) {
                uploadedEvidenceUrl = await uploadMediaEvidenceFile("evidence", mediaFile);
            }

            const issuePayload = {
                asset_id: window.activePublicAssetReferenceNode.id,
                title: document.getElementById("issue-title").value.trim(),
                priority: document.getElementById("issue-priority").value,
                category: document.getElementById("issue-category").value.trim(),
                description: document.getElementById("issue-description").value.trim(),
                reporter_name: document.getElementById("issue-rep-name").value.trim(),
                reporter_email: document.getElementById("issue-rep-email").value.trim(),
                evidence_url: uploadedEvidenceUrl,
                status: "Reported"
            };

            const { data: insertedIssue, error: issueErr } = await supabase
                .from("issues")
                .insert(issuePayload)
                .select()
                .single();

            if (issueErr) throw issueErr;

            await supabase
                .from("assets")
                .update({ status: "Issue Reported" })
                .eq("id", window.activePublicAssetReferenceNode.id);

            await supabase.from("asset_history").insert({
                asset_id: window.activePublicAssetReferenceNode.id,
                issue_id: insertedIssue.id,
                action: `Public Incident Ticket Raised (#${insertedIssue.issue_number})`,
                actor_name: document.getElementById("issue-rep-name").value.trim(),
                status_snapshot: "Issue Reported"
            });

            UI.showToast("Incident entry successfully verified.");
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            UI.showToast(err.message, "danger");
            submitBtn.disabled = false;
        }
    });
}
