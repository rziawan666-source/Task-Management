<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tasks', 'due_at')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->timestamp('due_at')->nullable()->after('status');
            });
        }

        if (Schema::hasColumn('tasks', 'due_date')) {
            $tz = config('app.timezone');

            $rows = DB::table('tasks')->whereNotNull('due_date')->select('id', 'due_date')->get();

            foreach ($rows as $row) {
                $dueAt = Carbon::parse($row->due_date, $tz)->endOfDay();
                DB::table('tasks')->where('id', $row->id)->update(['due_at' => $dueAt]);
            }

            foreach (Schema::getIndexes('tasks') as $index) {
                $name = $index['name'] ?? '';
                if ($name === 'PRIMARY') {
                    continue;
                }
                $cols = $index['columns'] ?? [];
                if (in_array('due_date', $cols, true)) {
                    Schema::table('tasks', function (Blueprint $table) use ($name) {
                        $table->dropIndex($name);
                    });
                }
            }

            Schema::table('tasks', function (Blueprint $table) {
                $table->dropColumn('due_date');
            });
        }

        $hasUserDueAt = collect(Schema::getIndexes('tasks'))->contains(function (array $index) {
            return ($index['columns'] ?? []) === ['user_id', 'due_at'];
        });

        if (! $hasUserDueAt) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->index(['user_id', 'due_at']);
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('tasks', 'due_date')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->date('due_date')->nullable()->after('status');
            });
        }

        if (Schema::hasColumn('tasks', 'due_at')) {
            $rows = DB::table('tasks')->whereNotNull('due_at')->select('id', 'due_at')->get();

            foreach ($rows as $row) {
                DB::table('tasks')->where('id', $row->id)->update([
                    'due_date' => Carbon::parse($row->due_at)->toDateString(),
                ]);
            }
        }

        foreach (Schema::getIndexes('tasks') as $index) {
            $name = $index['name'] ?? '';
            if ($name === 'PRIMARY') {
                continue;
            }
            $cols = $index['columns'] ?? [];
            if (in_array('due_at', $cols, true)) {
                Schema::table('tasks', function (Blueprint $table) use ($name) {
                    $table->dropIndex($name);
                });
            }
        }

        if (Schema::hasColumn('tasks', 'due_at')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropColumn('due_at');
            });
        }

        $hasUserDueDate = collect(Schema::getIndexes('tasks'))->contains(function (array $index) {
            return ($index['columns'] ?? []) === ['user_id', 'due_date'];
        });

        if (! $hasUserDueDate) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->index(['user_id', 'due_date']);
            });
        }
    }
};
