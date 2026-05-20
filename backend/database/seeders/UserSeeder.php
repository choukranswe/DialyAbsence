<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['nom' => 'Admin', 'prenom' => 'Centre', 'email' => 'admin@dialyse.ma', 'role' => 'admin', 'telephone' => '0611111111'],
            ['nom' => 'Bennani', 'prenom' => 'Nadia', 'email' => 'medecin@dialyse.ma', 'role' => 'medecin', 'telephone' => '0622222222'],
            ['nom' => 'El Idrissi', 'prenom' => 'Youssef', 'email' => 'medecin2@dialyse.ma', 'role' => 'medecin', 'telephone' => '0622222223'],
            ['nom' => 'Alaoui', 'prenom' => 'Sara', 'email' => 'infirmier@dialyse.ma', 'role' => 'infirmier', 'telephone' => '0633333333'],
            ['nom' => 'Fassi', 'prenom' => 'Hamza', 'email' => 'infirmier2@dialyse.ma', 'role' => 'infirmier', 'telephone' => '0633333334'],
            ['nom' => 'Mansouri', 'prenom' => 'Imane', 'email' => 'infirmier3@dialyse.ma', 'role' => 'infirmier', 'telephone' => '0633333335'],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [...$user, 'password' => Hash::make('password'), 'actif' => true]
            );
        }
    }
}
