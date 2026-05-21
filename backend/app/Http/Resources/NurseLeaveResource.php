<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NurseLeaveResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nurse_id' => $this->nurse_id,
            'nurse' => $this->whenLoaded('nurse', fn () => [
                'id' => $this->nurse?->id,
                'full_name' => $this->nurse?->full_name,
                'phone' => $this->nurse?->phone,
                'shift' => $this->nurse?->shift,
            ]),
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'leave_type' => $this->leave_type,
            'reason' => $this->reason,
            'status' => $this->status,
            'approved_by' => $this->approved_by,
            'approver' => $this->whenLoaded('approver', fn () => $this->approver ? [
                'id' => $this->approver->id,
                'nom_complet' => $this->approver->nom_complet,
                'email' => $this->approver->email,
            ] : null),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
