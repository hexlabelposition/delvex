package com.delvex.server.shipment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.delvex.server.branch.Branch;
import com.delvex.server.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reference_number", nullable = false, unique = true, length = 40)
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShipmentStatus status;

    @Column(name = "origin_country", nullable = false, length = 2)
    private String originCountry;

    @Column(name = "origin_city", nullable = false, length = 100)
    private String originCity;

    @Column(name = "origin_postal_code", nullable = false, length = 20)
    private String originPostalCode;

    @Column(name = "origin_address", nullable = false, length = 255)
    private String originAddress;

    @Column(name = "destination_country", nullable = false, length = 2)
    private String destinationCountry;

    @Column(name = "destination_city", nullable = false, length = 100)
    private String destinationCity;

    @Column(name = "destination_postal_code", nullable = false, length = 20)
    private String destinationPostalCode;

    @Column(name = "destination_address", nullable = false, length = 255)
    private String destinationAddress;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "origin_branch_id", nullable = false)
    private Branch originBranch;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_branch_id", nullable = false)
    private Branch destinationBranch;

    @Column(name = "cargo_description", nullable = false, length = 500)
    private String cargoDescription;

    @Column(name = "weight_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "pickup_at")
    private Instant pickupAt;

    @Column(name = "delivery_at")
    private Instant deliveryAt;

    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Shipment() {
    }

    public Shipment(
            User user,
            String referenceNumber,
            Branch originBranch,
            Branch destinationBranch,
            String cargoDescription,
            BigDecimal weightKg,
            Instant pickupAt,
            Instant deliveryAt) {
        validateSchedule(pickupAt, deliveryAt);

        this.user = user;
        this.referenceNumber = referenceNumber;
        this.status = ShipmentStatus.CREATED;
        applyOriginBranch(originBranch);
        applyDestinationBranch(destinationBranch);
        this.cargoDescription = cargoDescription;
        this.weightKg = weightKg;
        this.pickupAt = pickupAt;
        this.deliveryAt = deliveryAt;
    }

    @PrePersist
    private void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    private void onUpdate() {
        updatedAt = Instant.now();
    }

    public void update(
            Branch originBranch,
            Branch destinationBranch,
            String cargoDescription,
            BigDecimal weightKg,
            Instant pickupAt,
            Instant deliveryAt) {
        validateUpdate();

        Instant updatedPickupAt = pickupAt != null ? pickupAt : this.pickupAt;
        Instant updatedDeliveryAt = deliveryAt != null ? deliveryAt : this.deliveryAt;

        validateSchedule(updatedPickupAt, updatedDeliveryAt);

        if (originBranch != null) {
            applyOriginBranch(originBranch);
        }
        if (destinationBranch != null) {
            applyDestinationBranch(destinationBranch);
        }
        this.cargoDescription = valueOrCurrent(cargoDescription, this.cargoDescription);
        this.weightKg = valueOrCurrent(weightKg, this.weightKg);
        this.pickupAt = updatedPickupAt;
        this.deliveryAt = updatedDeliveryAt;
    }

    public void validateDeletion() {
        if (!status.canBeDeleted()) {
            throw new InvalidShipmentStateException(
                    status + " shipments cannot be deleted");
        }
    }

    private void validateUpdate() {
        if (status != ShipmentStatus.CREATED) {
            throw new InvalidShipmentStateException(
                    status + " shipments cannot be updated");
        }
    }

    private void applyOriginBranch(Branch branch) {
        originBranch = branch;
        originCountry = branch.getCountry();
        originCity = branch.getCity();
        originPostalCode = branch.getPostalCode();
        originAddress = branch.getAddress();
    }

    private void applyDestinationBranch(Branch branch) {
        destinationBranch = branch;
        destinationCountry = branch.getCountry();
        destinationCity = branch.getCity();
        destinationPostalCode = branch.getPostalCode();
        destinationAddress = branch.getAddress();
    }

    private void validateSchedule(Instant pickupAt, Instant deliveryAt) {
        if (pickupAt != null && deliveryAt != null && deliveryAt.isBefore(pickupAt)) {
            throw new InvalidShipmentScheduleException();
        }
    }

    private <T> T valueOrCurrent(T value, T current) {
        return value != null ? value : current;
    }

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public ShipmentStatus getStatus() {
        return status;
    }

    public String getOriginCountry() {
        return originCountry;
    }

    public String getOriginCity() {
        return originCity;
    }

    public String getOriginPostalCode() {
        return originPostalCode;
    }

    public String getOriginAddress() {
        return originAddress;
    }

    public String getDestinationCountry() {
        return destinationCountry;
    }

    public String getDestinationCity() {
        return destinationCity;
    }

    public String getDestinationPostalCode() {
        return destinationPostalCode;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public Branch getOriginBranch() {
        return originBranch;
    }

    public Branch getDestinationBranch() {
        return destinationBranch;
    }

    public String getCargoDescription() {
        return cargoDescription;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public Instant getPickupAt() {
        return pickupAt;
    }

    public Instant getDeliveryAt() {
        return deliveryAt;
    }

    public long getVersion() {
        return version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
