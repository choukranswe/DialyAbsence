<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machines', function (Blueprint $table): void {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->string('numero', 10)->unique();
            $table->string('marque');
            $table->string('modele');
            $table->enum('statut', ['disponible', 'en_utilisation', 'maintenance', 'hors_service'])->default('disponible');
            $table->date('date_installation')->nullable();
            $table->date('date_derniere_maintenance')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};
