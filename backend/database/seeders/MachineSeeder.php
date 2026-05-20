<?php

namespace Database\Seeders;

use App\Models\Machine;
use Illuminate\Database\Seeder;

class MachineSeeder extends Seeder
{
    public function run(): void
    {
        for ($index = 1; $index <= 12; $index++) {
            Machine::updateOrCreate(
                ['numero' => sprintf('M%02d', $index)],
                [
                    'marque' => 'Fresenius',
                    'modele' => '4008S',
                    'statut' => 'disponible',
                    'date_installation' => now()->subYears(2)->addMonths($index)->toDateString(),
                    'notes' => null,
                ]
            );
        }
    }
}
