<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nurses', function (Blueprint $table): void {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->string('full_name');
            $table->string('phone', 20)->nullable();
            $table->string('shift', 80)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('full_name');
        });

        Schema::table('patients', function (Blueprint $table): void {
            $table->string('emergency_contact', 120)->nullable()->after('telephone');
            $table->enum('dialysis_group', ['L/M/V', 'M/J/S'])->nullable()->after('insurance_number');
            $table->unsignedBigInteger('assigned_machine_id')->nullable()->after('dialysis_group');

            $table->index('dialysis_group');
            $table->index('assigned_machine_id');
            $table->foreign('assigned_machine_id')->references('id')->on('machines')->nullOnDelete();
        });

        Schema::table('seances', function (Blueprint $table): void {
            $table->unsignedBigInteger('nurse_id')->nullable()->after('machine_id');
            $table->index('nurse_id');
            $table->foreign('nurse_id')->references('id')->on('nurses')->nullOnDelete();
        });

        if (Schema::hasColumn('seances', 'infirmier_id')) {
            Schema::table('seances', function (Blueprint $table): void {
                $table->dropForeign(['infirmier_id']);
                $table->dropColumn('infirmier_id');
            });
        }

        Schema::create('nurse_leaves', function (Blueprint $table): void {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->id();
            $table->unsignedBigInteger('nurse_id');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('leave_type', ['annual_leave', 'sick_leave', 'exceptional_leave', 'vacation', 'rest_day']);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'refused', 'cancelled'])->default('pending');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('nurse_id');
            $table->index('approved_by');
            $table->index(['start_date', 'end_date']);
            $table->index('status');
            $table->foreign('nurse_id')->references('id')->on('nurses')->cascadeOnDelete();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nurse_leaves');

        Schema::table('seances', function (Blueprint $table): void {
            $table->unsignedBigInteger('infirmier_id')->nullable()->after('machine_id');
            $table->index('infirmier_id');
            $table->foreign('infirmier_id')->references('id')->on('users')->nullOnDelete();
        });

        if (Schema::hasColumn('seances', 'nurse_id')) {
            Schema::table('seances', function (Blueprint $table): void {
                $table->dropForeign(['nurse_id']);
                $table->dropColumn('nurse_id');
            });
        }

        Schema::table('patients', function (Blueprint $table): void {
            $table->dropForeign(['assigned_machine_id']);
            $table->dropIndex(['dialysis_group']);
            $table->dropIndex(['assigned_machine_id']);
            $table->dropColumn(['emergency_contact', 'dialysis_group', 'assigned_machine_id']);
        });

        Schema::dropIfExists('nurses');
    }
};
