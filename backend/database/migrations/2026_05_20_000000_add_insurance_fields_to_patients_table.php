<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table): void {
            $table->string('organisme', 120)->nullable()->after('notes');
            $table->string('insurance_number', 120)->nullable()->after('organisme');
            $table->string('coverage_type', 120)->nullable()->after('insurance_number');
            $table->date('coverage_expiration')->nullable()->after('coverage_type');

            $table->index('organisme');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table): void {
            $table->dropIndex(['organisme']);
            $table->dropColumn([
                'organisme',
                'insurance_number',
                'coverage_type',
                'coverage_expiration',
            ]);
        });
    }
};
