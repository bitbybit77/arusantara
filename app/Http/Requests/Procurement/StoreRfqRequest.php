<?php

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class StoreRfqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'installation_location' => ['nullable', 'string', 'max:255'],
            'due_at' => ['nullable', 'date', 'after_or_equal:today'],
            'customer_note' => ['nullable', 'string', 'max:1000'],
            'preferred_maker_profile_ids' => ['nullable', 'array'],
            'preferred_maker_profile_ids.*' => ['integer', 'distinct', 'exists:maker_profiles,id'],
        ];
    }
}
