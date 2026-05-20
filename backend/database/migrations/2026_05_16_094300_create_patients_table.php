<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table): void {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('cin')->unique();
            $table->date('date_naissance');
            $table->enum('sexe', ['M', 'F']);
            $table->string('telephone', 20);
            $table->string('adresse');
            $table->string('ville');
            $table->enum('groupe_sanguin', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
            $table->decimal('poids', 5, 2);
            $table->smallInteger('taille');
            $table->text('cause_insuffisance_renale');
            $table->unsignedBigInteger('nephrologue_id')->nullable();
            $table->date('date_entree');
            $table->boolean('actif')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('nephrologue_id');
            $table->index(['nom', 'prenom']);
            $table->index('actif');
            $table->foreign('nephrologue_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
