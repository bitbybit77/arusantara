<?php

namespace App\Http\Requests\Configuration;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectConfigurationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCustomer() === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1', 'max:30'],
            'items.*.equipment_model_id' => ['required', 'integer', 'distinct', 'exists:equipment_models,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'items.*.equipment_status' => ['required', 'string', 'in:existing,planned'],
            'items.*.simultaneous_use' => ['required', 'boolean'],
        ];
    }
}
