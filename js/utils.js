export const UI = {
    /**
     * Spawns a floating, auto-dismissing notification toast
     */
    showToast(message, type = "success") {
        const fallbackContainer = document.body;
        let alertWrapper = document.getElementById("toast-notification-region");
        
        if (!alertWrapper) {
            alertWrapper = document.createElement("div");
            alertWrapper.id = "toast-notification-region";
            alertWrapper.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
            fallbackContainer.appendChild(alertWrapper);
        }

        const notificationNode = document.createElement("div");
        notificationNode.className = `alert alert-${type} shadow-lg border-0 animate__animated animate__fadeInRight text-dark`;
        notificationNode.style.background = "rgba(255,255,255,0.95)";
        notificationNode.style.backdropFilter = "blur(10px)";
        notificationNode.style.borderLeft = `5px solid var(--bs-${type})`;
        notificationNode.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <span class="fw-semibold small"><i class="bi bi-info-circle-fill me-2"></i>${message}</span>
                <button type="button" class="btn-close small ms-3" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        alertWrapper.appendChild(notificationNode);
        
        // Auto-dismiss cleanup loop after 4 seconds
        setTimeout(() => {
            notificationNode.classList.replace("animate__fadeInRight", "animate__fadeOutRight");
            notificationNode.addEventListener("animationend", () => notificationNode.remove());
        }, 4000);
    },

    /**
     * Injects loading placeholder rows into a table structure while async pipelines fetch data
     */
    applyTableSkeleton(tableBodyContainer, columnSpanCount = 5) {
        if (!tableBodyContainer) return;
        tableBodyContainer.innerHTML = Array(3).fill(0).map(() => `
            <tr class="placeholder-glow">
                ${Array(columnSpanCount).fill(0).map(() => `
                    <td><span class="placeholder col-10 py-3 rounded-2 bg-secondary opacity-25"></span></td>
                `).join('')}
            </tr>
        `).join('');
    }
};