package com.example.report_service.clients.support;

import com.fasterxml.jackson.databind.JsonNode;

public final class EnumMapper {

    private EnumMapper() {
    }

    public static String fromNode(JsonNode node, String... labels) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual()) {
            return node.asText();
        }
        if (node.isNumber()) {
            int idx = node.asInt();
            if (idx >= 0 && idx < labels.length) {
                return labels[idx];
            }
            return Integer.toString(idx);
        }
        return node.asText();
    }
}
