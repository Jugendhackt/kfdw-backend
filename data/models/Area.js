// minified using the https://overpass-api.de/api/convert API and overpass-turbo
const REQUEST_GET_PARAMETER = `?data=[out%3Ajson][timeout%3A60]%3Barea(__AREAID__)->.searchArea%3B(node["amenity"%3D"waste_basket"](area.searchArea)%3Bnode["vending"%3D"excrement_bags"](area.searchArea)%3B)%3Bout%3B>%3Bout skel qt%3B%0A`;

class Area {

    constructor(areaID) {
        // see https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#By_area_.28area.29
        //  "By convention the area id can be calculated from an existing OSM way by adding 2400000000
        //  to its OSM id, or in case of a relation by adding 3600000000 respectively."
        // 3600000000 == 36e8
        this.areaID = areaID + 36e8;
    }

    /**
     * returns the url to fetch all the wastebins
     * @returns URL
     */
    get url() {
        return new URL(
            REQUEST_GET_PARAMETER.replace('__AREAID__', this.areaID),
            new URL(process.env.OVERPASS_API_INTERPRETER_URL)
        );
    }

    toString() {
        return this.areaID;
    }

}

module.exports = Area;