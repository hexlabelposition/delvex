package com.delvex.server.shipment;

import java.util.Arrays;

public enum ShipmentLocation {
    WARSAW("Warszawa", "00-001", "Marszałkowska 1"),
    KRAKOW("Kraków", "30-001", "Floriańska 1"),
    WROCLAW("Wrocław", "50-001", "Rynek 1"),
    GDANSK("Gdańsk", "80-001", "Długi Targ 1");

    private final String city;
    private final String postalCode;
    private final String address;

    ShipmentLocation(String city, String postalCode, String address) {
        this.city = city;
        this.postalCode = postalCode;
        this.address = address;
    }

    public static ShipmentLocation fromId(String id) {
        return Arrays.stream(values())
                .filter(location -> location.name().equals(id))
                .findFirst()
                .orElseThrow(() -> new InvalidShipmentLocationException(id));
    }

    public String country() { return "PL"; }
    public String city() { return city; }
    public String postalCode() { return postalCode; }
    public String address() { return address; }
}
