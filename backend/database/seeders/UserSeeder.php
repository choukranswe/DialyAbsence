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
            ['nom' => 'Mjabber', 'prenom' => 'Mouna', 'email' => 'doctor@dialyse.ma', 'role' => 'doctor', 'telephone' => '0622222222'],
            ['nom' => 'Accueil', 'prenom' => 'Reception', 'email' => 'reception@dialyse.ma', 'role' => 'receptionist', 'telephone' => '0633333333'],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [...$user, 'password' => Hash::make('password'), 'actif' => true]
            );
        }

        User::where('role', 'doctor')
            ->where('email', '!=', 'doctor@dialyse.ma')
            ->update(['actif' => false]);

        User::whereIn('email', [
            'medecin@dialyse.ma',
            'medecin2@dialyse.ma',
            'infirmier@dialyse.ma',
            'infirmier2@dialyse.ma',
            'infirmier3@dialyse.ma',
        ])->update(['actif' => false]);
    }
}
