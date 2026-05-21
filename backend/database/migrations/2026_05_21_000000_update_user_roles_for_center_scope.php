<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY role VARCHAR(50) NOT NULL DEFAULT 'receptionist'");
        DB::table('users')->where('role', 'medecin')->update(['role' => 'doctor']);
        DB::table('users')->where('role', 'infirmier')->update(['role' => 'receptionist', 'actif' => false]);
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'doctor', 'receptionist') NOT NULL DEFAULT 'receptionist'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY role VARCHAR(50) NOT NULL DEFAULT 'infirmier'");
        DB::table('users')->where('role', 'doctor')->update(['role' => 'medecin']);
        DB::table('users')->where('role', 'receptionist')->update(['role' => 'infirmier']);
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'medecin', 'infirmier') NOT NULL DEFAULT 'infirmier'");
    }
};
