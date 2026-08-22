<?php

namespace App\Actions\Engineering;

use App\Engineering\PreliminaryEngineeringEngine;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationSnapshot;

final readonly class CalculateProjectConfiguration
{
    public function __construct(
        private PreliminaryEngineeringEngine $engine,
        private CreateCalculationSnapshot $createCalculationSnapshot,
    ) {}

    public function handle(
        ProjectConfiguration $projectConfiguration,
        ?int $calculatedByUserId = null,
    ): CalculationSnapshot {
        $inputPayload = CalculationSnapshot::captureInputPayload($projectConfiguration);
        $result = $this->engine->calculate($inputPayload);

        return $this->createCalculationSnapshot->handle(
            $projectConfiguration,
            $result->snapshotAttributes($calculatedByUserId),
            $result->calculationLines,
        );
    }
}
