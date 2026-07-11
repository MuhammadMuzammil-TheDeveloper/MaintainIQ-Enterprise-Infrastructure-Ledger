export const SafeMockAIService = {
    /**
     * Parses natural language hardware symptoms into a structured maintenance payload
     */
    async processNaturalLanguageTriage(complaintText, assetMetadataNodeContext) {
        // Enforce basic network transmission loading illusion wait period
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const lowerText = complaintText.toLowerCase();
        let determinedPriority = "Medium";
        let titleInferred = `Anomalous Behavior Flagged on ${assetMetadataNodeContext.name}`;
        let possibleCauses = "General operational variance or internal configuration divergence.";
        let initialChecks = "Ensure baseline interface links are seated securely and confirm power distribution indices matches target specs.";

        if (lowerText.includes("smoke") || lowerText.includes("fire") || lowerText.includes("spark") || lowerText.includes("burning")) {
            determinedPriority = "Critical";
            titleInferred = `Thermal Breach / Electrical Event on ${assetMetadataNodeContext.name}`;
            possibleCauses = "Power supply failure, localized thermal runaway, or internal capacitor failure.";
            initialChecks = "IMMEDIATELY DISCONNECT MAIN POWER LINE FEED IN WALL BREAKERS. EVACUATE ADJACENT BAY ZONES.";
        } else if (lowerText.includes("leak") || lowerText.includes("water") || lowerText.includes("fluid")) {
            determinedPriority = "High";
            titleInferred = `Liquid Damage Triage on ${assetMetadataNodeContext.name}`;
            possibleCauses = "Adjacent structural facility HVAC failure, cooling line rupture, or secondary fluid ingress.";
            initialChecks = "Shut off upstream liquid containment shutoff valves. Shield electronics bays using static covers.";
        } else if (lowerText.includes("slow") || lowerText.includes("lag") || lowerText.includes("freeze") || lowerText.includes("stuck")) {
            determinedPriority = "Low";
            titleInferred = `Performance Degradation Audit on ${assetMetadataNodeContext.name}`;
            possibleCauses = "Memory allocation exhaust, internal disk buffer saturation, or component firmware loop hang.";
            initialChecks = "Initiate warm telemetry diagnostic report loop. Review background systemic run logs.";
        }

        return {
            title: titleInferred,
            priority: determinedPriority,
            category: assetMetadataNodeContext.category,
            possibleCauses,
            initialChecks
        };
    }
};