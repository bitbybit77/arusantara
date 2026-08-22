<?php

namespace App\Engineering;

use App\Equipment\ElectricalPhase;

final readonly class PreliminaryEngineeringResult
{
    /**
     * @param  list<array<string, mixed>>  $assumptions
     * @param  list<array<string, mixed>>  $warnings
     * @param  list<string>  $rulesApplied
     * @param  list<array<string, mixed>>  $calculationLines
     */
    public function __construct(
        public string $calculatorVersion,
        public float $connectedLoadW,
        public float $designLoadW,
        public ?float $designCurrentA,
        public ?float $recommendedSupplyV,
        public ?ElectricalPhase $recommendedPhase,
        public EngineeringResultStatus $resultStatus,
        public array $assumptions,
        public array $warnings,
        public array $rulesApplied,
        public array $calculationLines,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function snapshotAttributes(?int $calculatedByUserId = null): array
    {
        return [
            'calculator_version' => $this->calculatorVersion,
            'connected_load_w' => $this->connectedLoadW,
            'design_load_w' => $this->designLoadW,
            'design_current_a' => $this->designCurrentA,
            'recommended_supply_v' => $this->recommendedSupplyV,
            'recommended_phase' => $this->recommendedPhase,
            'result_status' => $this->resultStatus,
            'result_payload' => [
                'schema_version' => 1,
                'kind' => 'preliminary_panel_configuration',
                'rules_applied' => $this->rulesApplied,
                'supply_recommendation' => [
                    'voltage_v' => $this->recommendedSupplyV,
                    'phase' => $this->recommendedPhase?->value,
                    'design_current_a' => $this->designCurrentA,
                ],
                'scope' => [
                    'classification' => 'preliminary_engineering',
                    'final_design' => false,
                    'professional_verification_required' => true,
                ],
            ],
            'assumptions' => $this->assumptions,
            'warnings' => $this->warnings,
            'calculated_by_user_id' => $calculatedByUserId,
        ];
    }
}
