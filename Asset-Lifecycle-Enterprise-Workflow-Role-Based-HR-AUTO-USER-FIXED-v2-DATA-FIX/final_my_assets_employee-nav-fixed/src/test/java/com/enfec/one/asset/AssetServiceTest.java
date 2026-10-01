package com.enfec.one.asset;

import com.enfec.one.asset.dto.request.CreateAssetRequest;
import com.enfec.one.asset.dto.response.AssetResponse;
import com.enfec.one.asset.entity.Asset;
import com.enfec.one.asset.entity.AssetEvent;
import com.enfec.one.asset.entity.AssetStatus;
import com.enfec.one.asset.exception.InvalidAssetStatusException;
import com.enfec.one.asset.repository.AssetEventRepository;
import com.enfec.one.asset.repository.AssetRepository;
import com.enfec.one.asset.service.AssetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {
    @Mock AssetRepository assetRepository;
    @Mock AssetEventRepository eventRepository;
    private AssetService service;

    @BeforeEach
    void setUp() { service = new AssetService(assetRepository, eventRepository); }

    @Test
    void createStartsAssetInStock() {
        CreateAssetRequest request = new CreateAssetRequest(
                "AST-1001", "laptop", "Dell", "Latitude 5450", "SER-1001",
                null, null, 8500000L, "INR", "NEW", "Test asset");
        when(assetRepository.existsByAssetTag("AST-1001")).thenReturn(false);
        when(assetRepository.existsBySerialNumber("SER-1001")).thenReturn(false);
        when(assetRepository.save(any(Asset.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AssetResponse response = service.create(request);

        assertThat(response.status()).isEqualTo("IN_STOCK");
        verify(eventRepository).save(any(AssetEvent.class));
    }

    @Test
    void rejectsUnsupportedStatus() {
        UUID id = UUID.randomUUID();
        Asset asset = new Asset("AST-1002", "laptop", "Dell", "Latitude", "SER-1002", null, null, null, null, "NEW", null);
        when(assetRepository.findById(id)).thenReturn(Optional.of(asset));

        assertThatThrownBy(() -> service.updateStatus(id, "LOST", "it-admin"))
                .isInstanceOf(InvalidAssetStatusException.class);
        verify(assetRepository, never()).save(any());
    }

    @Test
    void acceptsHumanReadableStatus() {
        UUID id = UUID.randomUUID();
        Asset asset = new Asset("AST-1003", "laptop", "Dell", "Latitude", "SER-1003", null, null, null, null, "NEW", null);
        when(assetRepository.findById(id)).thenReturn(Optional.of(asset));
        when(assetRepository.save(any(Asset.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AssetResponse response = service.updateStatus(id, "In Repair", "it-admin");

        assertThat(response.status()).isEqualTo(AssetStatus.IN_REPAIR.name());
        verify(eventRepository).save(any(AssetEvent.class));
    }
}
