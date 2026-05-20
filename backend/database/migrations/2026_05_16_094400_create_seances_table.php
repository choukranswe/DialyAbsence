<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seances', function (Blueprint $table): void {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('machine_id');
            $table->unsignedBigInteger('infirmier_id')->nullable();
            $table->date('date_seance');
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->unsignedSmallInteger('duree_minutes');
            $table->enum('statut', ['planifiee', 'effectuee', 'annulee'])->default('planifiee');
            $table->string('tension_avant', 10)->nullable();
            $table->string('tension_apres', 10)->nullable();
            $table->decimal('poids_avant', 5, 2)->nullable();
            $table->decimal('poids_apres', 5, 2)->nullable();
            $table->decimal('poids_sec', 5, 2)->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();

            $table->index('patient_id');
            $table->index('machine_id');
            $table->index('infirmier_id');
            $table->index(['date_seance', 'statut']);
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreign('machine_id')->references('id')->on('machines')->restrictOnDelete();
            $table->foreign('infirmier_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seances');
    }
};
