<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MachineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'marque' => $this->marque,
            'modele' => $this->modele,
            'statut' => $this->statut,
            'date_installation' => $this->date_installation?->toDateString(),
            'date_derniere_maintenance' => $this->date_derniere_maintenance?->toDateString(),
            'notes' => $this->notes,
            'seances_count' => $this->seances_count ?? null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
