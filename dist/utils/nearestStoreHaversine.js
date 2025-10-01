"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistance = getDistance;
function getDistance(lat1, long1, lat2, long2) {
    if (lat1 == null || long1 == null || lat2 == null || long2 == null) {
        return null;
    }
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLong = ((long2 - long1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLong / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
//# sourceMappingURL=nearestStoreHaversine.js.map