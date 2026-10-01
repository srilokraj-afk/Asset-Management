package com.enfec.one.asset;
import com.enfec.one.asset.entity.AssetStatus;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
class AssetStatusTest {
 @Test void supportsExactlyTheRequiredStatuses(){assertThat(AssetStatus.values()).extracting(Enum::name).containsExactly("IN_STOCK","ASSIGNED","IN_REPAIR","RETIRED");}
}
