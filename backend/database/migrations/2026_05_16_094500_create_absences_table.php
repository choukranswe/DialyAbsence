<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absences', function (Blueprint $table): void {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('seance_id')->nullable();
            $table->date('date_absence');
            $table->enum('motif', ['medical', 'personnel', 'hospitalise', 'autre']);
            $table->boolean('justifiee')->default(false);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('declared_by')->nullable();
            $table->timestamps();

            $table->index('patient_id');
            $table->index('seance_id');
            $table->index('declared_by');
            $table->index(['date_absence', 'motif', 'justifiee']);
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreign('seance_id')->references('id')->on('seances')->nullOnDelete();
            $table->foreign('declared_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};
